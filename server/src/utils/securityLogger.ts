import logger from './logger';

/**
 * Security Event Logger
 * Logs security-related events for monitoring and auditing
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  ADMIN_ACTION = 'ADMIN_ACTION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
}

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

/**
 * Log security event
 */
export const logSecurityEvent = (
  type: SecurityEventType,
  options: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  } = {}
): void => {
  const event: SecurityEvent = {
    type,
    userId: options.userId,
    ip: options.ip,
    userAgent: options.userAgent,
    details: options.details,
    severity: options.severity || 'medium',
    timestamp: new Date(),
  };

  const logMessage = {
    event: type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details,
    severity: event.severity,
    timestamp: event.timestamp.toISOString(),
  };

  // Log based on severity
  switch (event.severity) {
    case 'critical':
    case 'high':
      logger.error('Security Event:', logMessage);
      break;
    case 'medium':
      logger.warn('Security Event:', logMessage);
      break;
    case 'low':
      logger.info('Security Event:', logMessage);
      break;
  }
};

/**
 * Log failed login attempt
 */
export const logFailedLogin = (email: string, ip: string, userAgent?: string): void => {
  logSecurityEvent(SecurityEventType.LOGIN_FAILURE, {
    ip,
    userAgent,
    details: { email },
    severity: 'medium',
  });
};

/**
 * Log successful login
 */
export const logSuccessfulLogin = (
  userId: string,
  email: string,
  ip: string,
  userAgent?: string
): void => {
  logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
    userId,
    ip,
    userAgent,
    details: { email },
    severity: 'low',
  });
};

/**
 * Log brute force detection
 */
export const logBruteForce = (ip: string, attemptCount: number): void => {
  logSecurityEvent(SecurityEventType.BRUTE_FORCE_DETECTED, {
    ip,
    details: { attemptCount, blocked: true },
    severity: 'high',
  });
};

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = (
  userId: string | undefined,
  activity: string,
  ip?: string,
  details?: Record<string, any>
): void => {
  logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
    userId,
    ip,
    details: { activity, ...details },
    severity: 'high',
  });
};

/**
 * Log unauthorized access attempt
 */
export const logUnauthorizedAccess = (
  userId: string | undefined,
  resource: string,
  ip?: string
): void => {
  logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
    userId,
    ip,
    details: { resource },
    severity: 'high',
  });
};

/**
 * Log admin action
 */
export const logAdminAction = (
  adminId: string,
  action: string,
  targetId?: string,
  details?: Record<string, any>
): void => {
  logSecurityEvent(SecurityEventType.ADMIN_ACTION, {
    userId: adminId,
    details: { action, targetId, ...details },
    severity: 'medium',
  });
};

/**
 * Get client IP from request
 */
export const getClientIp = (req: any): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Get user agent from request
 */
export const getUserAgent = (req: any): string | undefined => {
  return req.headers['user-agent'];
};












