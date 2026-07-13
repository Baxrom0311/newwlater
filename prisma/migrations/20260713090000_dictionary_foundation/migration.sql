CREATE TYPE "DictionaryScript" AS ENUM ('CYRILLIC', 'OLD_LATIN', 'NEW_LATIN', 'MIXED');

CREATE TYPE "ConversionDirection" AS ENUM ('OLD_LATIN_TO_NEW', 'CYRILLIC_TO_NEW', 'ANY');

CREATE TABLE "UzbekDictionaryWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "script" "DictionaryScript" NOT NULL,
    "source" TEXT NOT NULL,
    "license" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UzbekDictionaryWord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversionException" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "direction" "ConversionDirection" NOT NULL DEFAULT 'ANY',
    "reason" TEXT,
    "source" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversionException_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProtectedTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "reason" TEXT,
    "source" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectedTerm_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UzbekDictionaryWord_normalized_script_source_key" ON "UzbekDictionaryWord"("normalized", "script", "source");
CREATE INDEX "UzbekDictionaryWord_normalized_idx" ON "UzbekDictionaryWord"("normalized");
CREATE INDEX "UzbekDictionaryWord_script_idx" ON "UzbekDictionaryWord"("script");

CREATE UNIQUE INDEX "ConversionException_normalized_direction_key" ON "ConversionException"("normalized", "direction");
CREATE INDEX "ConversionException_active_direction_idx" ON "ConversionException"("active", "direction");

CREATE UNIQUE INDEX "ProtectedTerm_normalized_key" ON "ProtectedTerm"("normalized");
CREATE INDEX "ProtectedTerm_active_idx" ON "ProtectedTerm"("active");
