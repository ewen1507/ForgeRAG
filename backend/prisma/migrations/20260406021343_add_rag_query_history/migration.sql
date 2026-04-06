-- CreateTable
CREATE TABLE "RagQuery" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RagQuery_userId_idx" ON "RagQuery"("userId");

-- CreateIndex
CREATE INDEX "RagQuery_createdAt_idx" ON "RagQuery"("createdAt");

-- AddForeignKey
ALTER TABLE "RagQuery" ADD CONSTRAINT "RagQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
