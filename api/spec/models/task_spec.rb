require 'rails_helper'

RSpec.describe Task, type: :model do
  # For validations that need an existing user
  let(:user) { create(:user) }
  subject    { build(:task, user: user) }

  describe "factory" do
    it "is valid" do
      expect(subject).to be_valid
    end
  end

  describe "validations" do
    it { should belong_to(:user) }
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:status) }
  end

  describe "enums" do
    it "defines the correct statuses" do
      expect(described_class.statuses).to include(
        "pending"     => 0,
        "in_progress" => 1,
        "completed"   => 2,
        "cancelled" => 3
      )
    end
  end

  describe "due_date behavior" do
    it "allows nil due_date" do
      task = build(:task, due_date: nil, user: user)
      expect(task).to be_valid
    end

    it "accepts a future due_date" do
      task = build(:task, due_date: Date.today + 3, user: user)
      expect(task).to be_valid
    end
  end
end
