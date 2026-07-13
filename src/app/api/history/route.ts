import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'
  const conversions = isPro
    ? await prisma.conversion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    : []

  return NextResponse.json({
    isPro,
    conversions: conversions.map(conversion => ({
      id: conversion.id,
      originalName: conversion.originalName,
      fileSize: conversion.fileSize,
      fileType: conversion.fileType,
      inputMode: conversion.inputMode,
      status: conversion.status,
      resultUrl: conversion.resultUrl,
      createdAt: conversion.createdAt.toISOString(),
    })),
  })
}
