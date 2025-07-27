# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  before_action :set_task, only: %i[show update destroy]

  # GET /tasks
  def index
    tasks = current_user.tasks.order(created_at: :desc)
    render json: tasks, status: :ok
  end

  # GET /tasks/:id
  def show
    render json: @task, status: :ok
  end

  # POST /tasks
  def create
    task = current_user.tasks.build(task_params)
    if task.save
      render json: task, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT/PATCH /tasks/:id
  def update
    if @task.update(task_params)
      render json: @task, status: :ok
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /tasks/:id
  def destroy
    @task.destroy
    head :no_content
  end

  private

  def set_task
    # Ensures user can only access their own tasks
    @task = current_user.tasks.find(params[:id])
  end

  def task_params
    # Permit only the fields you want clients to set
    params.require(:task).permit(:title, :description, :due_date, :status)
  end
end
