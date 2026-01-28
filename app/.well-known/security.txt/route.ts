import { NextResponse } from 'next/server'

export async function GET() {
  const securityTxt = `Contact: mailto:security@bawalnews.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en, hi
Canonical: https://www.bawalnews.com/.well-known/security.txt

# Security Policy
# If you discover a security vulnerability, please email us at security@bawalnews.com
# We appreciate responsible disclosure and will respond within 48 hours.
`

  return new NextResponse(securityTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

