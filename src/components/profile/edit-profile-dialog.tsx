"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional().nullable(),
  location: z.string().max(100, "Location must be less than 100 characters").optional().nullable(),
  emoji: z.string().max(2, "Emoji must be a single character").optional().nullable(),
  pronouns: z.string().max(30, "Pronouns must be less than 30 characters").optional().nullable(),
  favoriteCities: z.array(z.string()).optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface EditProfileDialogProps {
  initialData?: {
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    emoji?: string | null;
    pronouns?: string | null;
    favoriteCities?: string[] | null;
  };
  onProfileUpdated?: () => void;
}

// Common emojis for profile selection
const EMOJI_OPTIONS = [
  { value: "😊", label: "Smile 😊" },
  { value: "🚀", label: "Rocket 🚀" },
  { value: "🌟", label: "Star 🌟" },
  { value: "🌈", label: "Rainbow 🌈" },
  { value: "🏔️", label: "Mountain 🏔️" },
  { value: "🌊", label: "Wave 🌊" },
  { value: "🌲", label: "Tree 🌲" },
  { value: "🍦", label: "Ice Cream 🍦" },
  { value: "🧠", label: "Brain 🧠" },
  { value: "📚", label: "Books 📚" },
  { value: "🎨", label: "Art 🎨" },
  { value: "🎧", label: "Music 🎧" },
];

// Common pronouns for selection
const PRONOUN_OPTIONS = [
  { value: "he/him", label: "he/him" },
  { value: "she/her", label: "she/her" },
  { value: "they/them", label: "they/them" },
  { value: "he/they", label: "he/they" },
  { value: "she/they", label: "she/they" },
  { value: "custom", label: "Custom" },
];

export function EditProfileDialog({ initialData, onProfileUpdated }: EditProfileDialogProps) {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPronouns, setCustomPronouns] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: null,
      location: null,
      emoji: null,
      pronouns: null,
      favoriteCities: [],
    }
  });
  
  // Fetch current profile data when dialog opens
  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      
      const data = await response.json();
      
      if (data.profile) {
        form.reset({
          name: data.profile.name || session?.user?.name || "",
          bio: data.profile.bio || null,
          location: data.profile.location || null,
          emoji: data.profile.emoji || null,
          pronouns: data.profile.pronouns || null,
          favoriteCities: data.profile.favoriteCities || [],
        });
      }
      
      // Check if pronouns are custom
      if (data.profile.pronouns && !PRONOUN_OPTIONS.some(p => p.value === data.profile.pronouns)) {
        setCustomPronouns(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile data", error);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Your session has expired. Please refresh the page and try again.");
          return;
        }
        throw new Error("Failed to update profile");
      }
      
      const result = await response.json();
      
      // Update the session to reflect the changes
      try {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
          },
        });
      } catch (sessionError) {
        console.error("Failed to update session, but profile was updated:", sessionError);
        // Continue as the profile was still updated on the server
      }
      
      // Close the dialog
      setOpen(false);
      
      // Notify parent of update
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md">
            {error}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. she/her, they/them" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. San Francisco, CA" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Emoji</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Choose an emoji" 
                      {...field} 
                      value={field.value || ""} 
                      maxLength={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write a short bio about yourself" 
                      className="resize-none"
                      rows={4}
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch("bio")?.length || 0}/160 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 