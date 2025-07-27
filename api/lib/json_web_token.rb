require "jwt"

class JsonWebToken
  # Use the ENV var JWT_SECRET if present, otherwise fall back to Rails' secret_key_base
  SECRET_KEY = ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }

  # Encodes the payload with an expiration (default: 24h) into a JWT
  # @param payload [Hash] data to encode (e.g. { user_id: 1 })
  # @param exp_hours [Integer] hours until expiration
  # @return [String] the signed token
  def self.encode(payload, exp_hours = 24)
    payload = payload.dup
    payload[:exp] = exp_hours.hours.from_now.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  # Decodes a token, returning the payload hash with indifferent access
  # @param token [String] the JWT
  # @raise [JWT::DecodeError] if invalid or expired
  # @return [HashWithIndifferentAccess]
  def self.decode(token)
    decoded_token = JWT.decode(token, SECRET_KEY, true, algorithm: "HS256")
    HashWithIndifferentAccess.new(decoded_token.first)
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError => e
    # Re‐raise so your controller can rescue and return 401
    raise JWT::DecodeError, e.message
  end
end
