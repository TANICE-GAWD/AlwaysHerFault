const rateLimit = new Map()

export function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const userRequests = rateLimit.get(identifier) || []
  
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs)
  
  if (recentRequests.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
    }
  }
  
  recentRequests.push(now)
  rateLimit.set(identifier, recentRequests)
  
  return {
    allowed: true,
    remaining: limit - recentRequests.length,
    resetTime: Math.ceil(windowMs / 1000)
  }
}

export function getClientIdentifier(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}
