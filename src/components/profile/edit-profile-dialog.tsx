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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  emoji: z.string().max(2).optional(),
  pronouns: z.string().optional(),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
});

type FormData = z.infer<typeof formSchema>;

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

export function EditProfileDialog({ onProfileUpdated }: { onProfileUpdated?: () => void }) {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPronouns, setCustomPronouns] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      emoji: "",
      pronouns: "",
      bio: "",
    },
  });
  
  // Fetch current profile data when dialog opens
  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      
      const data = await response.json();
      
      form.reset({
        name: data.profile.name || "",
        location: data.profile.location || "",
        emoji: data.profile.emoji || "",
        pronouns: data.profile.pronouns || "",
        bio: data.profile.bio || "",
      });
      
      // Check if pronouns are custom
      if (data.profile.pronouns && !PRONOUN_OPTIONS.some(p => p.value === data.profile.pronouns)) {
        setCustomPronouns(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
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
        <Button variant="outline" size="sm">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                    <Input placeholder="Your name" {...field} disabled={loading} />
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
                    <Input placeholder="City, State" {...field} disabled={loading} />
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
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an emoji" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOJI_OPTIONS.map(emoji => (
                          <SelectItem key={emoji.value} value={emoji.value}>
                            {emoji.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2">
                    <Select
                      value={customPronouns ? "custom" : field.value || ""}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setCustomPronouns(true);
                          field.onChange("");
                        } else {
                          setCustomPronouns(false);
                          field.onChange(value);
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pronouns" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRONOUN_OPTIONS.map(pronoun => (
                          <SelectItem key={pronoun.value} value={pronoun.value}>
                            {pronoun.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {customPronouns && (
                      <Input
                        placeholder="Enter your pronouns"
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    )}
                  </div>
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
                      placeholder="A short bio about yourself"
                      {...field}
                      disabled={loading}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 