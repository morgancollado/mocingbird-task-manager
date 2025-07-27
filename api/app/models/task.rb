class Task < ApplicationRecord

  validates :title, :status, presence: true

  validate :due_date_in_future_or_nil

  belongs_to :user

    enum :status, {
    pending:     0,
    in_progress: 1,
    completed:   2,
    cancelled:   3
  }

  private

  def due_date_in_future_or_nil
    return if due_date.nil?      # allow no due date
    return if due_date > Date.today  # allow strictly future dates

    errors.add(:due_date, "must be in the future or blank")
  end
end
