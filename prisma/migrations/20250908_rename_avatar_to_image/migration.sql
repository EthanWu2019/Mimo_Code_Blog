-- Rename User.avatar → User.image to align User schema with @auth/prisma-adapter expectations.
-- The previous schema used 'avatar' (custom name), but @auth/prisma-adapter
-- calls prisma.user.create({ avatar? }) — column 'avatar' does not exist.
-- This migration renames the column in place so OAuth sign-in can create new
-- users with a profile image URL set to the rename target.
ALTER TABLE "User" RENAME COLUMN "avatar" TO "image";
