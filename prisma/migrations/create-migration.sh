#!/bin/bash

# Generate the initial Prisma migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate 