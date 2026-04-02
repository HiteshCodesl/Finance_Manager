-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "deletedBy" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedBy" TIMESTAMP(3);
