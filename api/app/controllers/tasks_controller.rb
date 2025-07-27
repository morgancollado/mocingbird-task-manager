class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: %i[show update destroy]


  def index
    render json: current_user.tasks.order(created_at: :desc), status: :ok
  end

  def show
    render json: @task, status: :ok
  end

  def create
    task = current_user.tasks.build(task_params)
    if task.save
      render json: task, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Applies both non-status attrs and an optional enum status change atomically
  def update
    attrs = task_params.to_h
    new_status = attrs.delete('status')  

    Task.transaction do
      # 1) Update non‑status attributes if present
      if attrs.any? && !@task.update(attrs)
        render json: { errors: @task.errors.full_messages }, status: 422
        raise ActiveRecord::Rollback
      end

      # 2) If client provided a status, validate & apply it
      if new_status.present?
        unless Task.statuses.key?(new_status)
          render json: { error: "Invalid status: #{new_status}" }, status: 422
          raise ActiveRecord::Rollback
        end

        # Only call bang if it’s actually changing
        @task.public_send("#{new_status}!") if @task.status != new_status
      end

      # 3) All good—render the updated task
      render json: @task, status: 200
    end
  end

  # DELETE /tasks/:id
  def destroy
    @task.destroy
    head :no_content
  end

  private

  def set_task
    @task = current_user.tasks.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  end

  # Permit title, description, due_date, and (optional) status
  def task_params
    params.require(:task).permit(:title, :description, :due_date, :status)
  end
end
