require 'rails_helper'

RSpec.describe User, type: :model do
  # use the built‑in subject for uniqueness tests
  subject { build(:user) }

  describe "factory" do
    it "is valid" do
      expect(build(:user)).to be_valid
    end
  end

  describe "validations" do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name)  }
    it { should validate_presence_of(:email)      }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should have_secure_password }
  end

  describe "associations" do
    it { should have_many(:tasks).dependent(:destroy) }
  end

  describe "dependent destroy" do
    it "removes tasks when user is destroyed" do
      user = create(:user)
      create_list(:task, 2, user: user)

      expect { user.destroy }.to change(Task, :count).by(-2)
    end
  end
end
