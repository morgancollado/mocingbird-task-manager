class User < ApplicationRecord
    before_validation { email.downcase! if email.present? }
    has_secure_password

      validates :email,
            presence:   true,
            uniqueness: { case_sensitive: false }
    validates :first_name, :last_name, presence: true
    validates :password,
            length: { minimum: 6 },
            if: -> { password.present? }

    has_many :tasks, dependent: :destroy
end
