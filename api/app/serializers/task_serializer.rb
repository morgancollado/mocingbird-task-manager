class TaskSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :due_date, :status, :created_at, :updated_at
end
