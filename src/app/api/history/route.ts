import { NextResponse } from 'next/server'
import { verifyToken } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function userIdFromBearer(req: Request) {
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null
  const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
  return payload.sub
}

export async function GET(req: Request) {
  const userId = await userIdFromBearer(req).catch(() => null)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }).catch(() => null)
  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'
  const conversions = isPro
    ? await prisma.conversion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }).catch(() => [])
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
