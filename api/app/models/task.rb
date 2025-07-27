class Task < ApplicationRecord
  include AASM

  validates :title, :status, presence: true

  validate :due_date_in_future_or_nil

  belongs_to :user

    enum :status, {
    pending:     0,
    in_progress: 1,
    completed:   2,
    cancelled:   3
  }

  aasm column: :status do
    state :pending, initial: true
    state :in_progress, :completed, :cancelled

    event :start do
      transitions from: :pending, to: :in_progress
    end

    event :complete do
      transitions from: %i[pending in_progress], to: :completed
      after { notify_creator_of_completion }
    end

   event :cancel do
      transitions from: %i[pending in_progress],
                  to:   :cancelled,
                  if:   :can_be_cancelled_by?
    end
  end

  private

  def notify_creator_of_completion
    TaskMailer.completed(self).deliver_later
  end

  def can_be_cancelled_by?(user)
     # e.g. only owners can cancel
     owner == Thread.current[:current_user]
  end

  def due_date_in_future_or_nil
    return if due_date.nil?      # allow no due date
    return if due_date > Date.today  # allow strictly future dates

    errors.add(:due_date, "must be in the future or blank")
  end
end
