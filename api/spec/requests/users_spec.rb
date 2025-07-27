require 'rails_helper'

RSpec.describe 'UsersController', type: :request do
  let!(:existing_user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: existing_user.id) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /users (signup)' do
    let(:valid_attrs) do
      {
        user: {
          first_name:            'New',
          last_name:             'User',
          email:                 'new@example.com',
          password:              'secure123',
          password_confirmation: 'secure123'
        }
      }
    end

    context 'with valid params' do
      it 'creates a user and returns token + serialized user' do
        expect {
          post '/users', params: valid_attrs
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['user']['email']).to eq('new@example.com')
      end
    end

    context 'with invalid params' do
      it 'returns unprocessable_entity' do
        post '/users', params: { user: { email: '' } }
        expect(response).to have_http_status(422)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end

  describe 'GET /users/:id' do
    it 'returns the user when authenticated' do
      get "/users/#{existing_user.id}", headers: auth_headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['email']).to eq(existing_user.email)
    end

    it 'blocks unauthenticated requests' do
      get "/users/#{existing_user.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /users/:id' do
    it 'updates first_name when authenticated' do
      put "/users/#{existing_user.id}",
          params: { user: { first_name: 'Updated' } },
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(existing_user.reload.first_name).to eq('Updated')
    end
  end

  describe 'DELETE /users/:id' do
    it 'deletes the user when authenticated' do
      expect {
        delete "/users/#{existing_user.id}", headers: auth_headers
      }.to change(User, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
