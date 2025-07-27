# spec/requests/tasks_spec.rb
require 'rails_helper'

RSpec.describe 'Tasks', type: :request do
  let!(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let!(:task) { create(:task, user: user) }

  describe 'GET /tasks' do
    it 'returns tasks for current user' do
      get '/tasks', headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.first['id']).to eq(task.id)
    end

    it 'blocks unauthenticated users' do
      get '/tasks'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /tasks/:id' do
    it 'returns the task' do
      get "/tasks/#{task.id}", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(task.id)
    end
  end

  describe 'POST /tasks' do
    let(:valid_params) do
      { task: { title: 'New Task', description: 'Desc', due_date: Date.tomorrow, status: 'pending' } }
    end

    it 'creates a new task' do
      expect {
        post '/tasks', params: valid_params, headers: headers
      }.to change(user.tasks, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe 'PUT /tasks/:id' do
    it 'updates the task' do
      put "/tasks/#{task.id}", params: { task: { status: 'completed' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(task.reload.status).to eq('completed')
    end
  end

  describe 'DELETE /tasks/:id' do
    it 'deletes the task' do
      expect {
        delete "/tasks/#{task.id}", headers: headers
      }.to change(user.tasks, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
