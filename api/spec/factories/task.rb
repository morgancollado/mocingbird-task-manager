# spec/factories/tasks.rb
FactoryBot.define do
  factory :task do
    title       { "Sample Task" }
    description { "Do something important" }
    due_date    { Date.today + 7 }
    status      { :pending }
    association :user
  end
end
