# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    first_name { "Jane" }
    last_name  { "Doe" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password" }
  end
end
