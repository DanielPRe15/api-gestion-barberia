export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'development_secret_only_for_local',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
};