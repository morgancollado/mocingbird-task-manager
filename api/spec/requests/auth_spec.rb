require 'rails_helper'

RSpec.describe 'AuthController', type: :request do
  let!(:user) { create(:user, email: 'login@example.com', password: 'password') }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /login' do
    context 'with valid credentials' do
      it 'returns a JWT and user info' do
        post '/login', params: {
          user: { email: 'login@example.com', password: 'password' }
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['user']['email']).to eq('login@example.com')
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized' do
        post '/login', params: {
          user: { email: 'login@example.com', password: 'wrongpass' }
        }

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid email or password')
      end
    end
  end

  describe 'DELETE /logout' do
    context 'with valid token' do
      it 'returns ok and logout message' do
        delete '/logout', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to match(/discard your token/)
      end
    end

    context 'without token' do
      it 'returns unauthorized' do
        delete '/logout'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
