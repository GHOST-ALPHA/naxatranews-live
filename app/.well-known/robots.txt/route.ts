import { NextResponse } from 'next/server'

// Some crawlers check .well-known/robots.txt
export async function GET() {
  return NextResponse.redirect('/robots.txt', 301)
}

