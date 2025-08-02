-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('google', 'github', 'email');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "provider" "public"."Provider" NOT NULL DEFAULT 'email',
ALTER COLUMN "password" DROP NOT NULL;
