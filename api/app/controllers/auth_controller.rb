# app/controllers/auth_controller.rb
class AuthController < ApplicationController
  # Skip token check for signup & login
  skip_before_action :authenticate_user!, only: %i[login]

  # POST /login
  def login
    user = User.find_by(email: login_params[:email].to_s.downcase)
    if user&.authenticate(login_params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: user.slice(:id, :first_name, :last_name, :email)
      }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  # DELETE /logout
  # With JWTs there’s no server‐side session to destroy; client should delete the token.
  def logout
    render json: { message: "Logged out. Please discard your token." }, status: :ok
  end

  private

  # Strong params for signup
  def signup_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation)
  end

  # Strong params for login
  def login_params
    params.require(:user).permit(:email, :password)
  end
end
