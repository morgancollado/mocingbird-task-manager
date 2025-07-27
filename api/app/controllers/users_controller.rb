# app/controllers/users_controller.rb
class UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create ]
  before_action :set_user, only: [ :show, :update, :destroy ]

  # GET /users/:id
  def show
    render json: @user, status: :ok
  end

  # POST /users  (signup)
  def create
    user = User.new(user_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user:  ActiveModelSerializers::SerializableResource.new(user)
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/:id
  def update
    if @user.update(user_update_params)
      render json: @user, status: :ok
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user)
          .permit(:first_name, :last_name, :email, :password, :password_confirmation)
  end

  def user_update_params
    params.require(:user)
          .permit(:first_name, :last_name, :email, :password, :password_confirmation)
          .reject { |_, v| v.blank? }
  end
end
