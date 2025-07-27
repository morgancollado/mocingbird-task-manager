class ApplicationController < ActionController::API
    before_action :authenticate_user!

  private

  def authenticate_user!
    header = request.headers["Authorization"]
    # split on a regular space to pull off the token after "Bearer"
    token = header&.split(" ")&.last

    return render json: { error: "Missing token" }, status: :unauthorized unless token

    begin
      payload       = JsonWebToken.decode(token)
      @current_user = User.find(payload["user_id"])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
