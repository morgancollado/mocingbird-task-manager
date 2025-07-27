# spec/requests/tasks_spec.rb
require 'rails_helper'

RSpec.describe 'Tasks', type: :request do
  let!(:user)       { create(:user) }
  let(:token)       { JsonWebToken.encode(user_id: user.id) }
  let(:headers)     { { 'Authorization' => "Bearer #{token}" } }
  let!(:task)       { create(:task, user: user, title: 'Original', description: 'Orig', due_date: 2.days.from_now, status: 'pending') }
  let(:new_title)   { 'Updated Title' }
  let(:new_due_date){ Date.tomorrow.iso8601 }
  
  describe 'GET /tasks' do
    it 'returns tasks for current user' do
      get '/tasks', headers: headers
      expect(response).to have_http_status(200)
      json = JSON.parse(response.body)
      expect(json.first['id']).to eq(task.id)
    end

    it 'blocks unauthenticated users' do
      get '/tasks'
      expect(response).to have_http_status(401)
    end
  end

  describe 'GET /tasks/:id' do
    it 'returns the task' do
      get "/tasks/#{task.id}", headers: headers
      expect(response).to have_http_status(200)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(task.id)
    end
  end

  describe 'POST /tasks' do
    let(:valid_params) do
      {
        task: {
          title:       'New Task',
          description: 'Desc',
          due_date:    Date.tomorrow.iso8601,
          status:      'pending'
        }
      }
    end

    it 'creates a new task' do
      expect {
        post '/tasks', params: valid_params, headers: headers
      }.to change(user.tasks, :count).by(1)
      expect(response).to have_http_status(201)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Task')
      expect(json['status']).to eq('pending')
    end
  end

  describe 'PUT /tasks/:id' do
    context 'when only status is provided' do
      it 'updates the status' do
        put "/tasks/#{task.id}",
            params: { task: { status: 'completed' } },
            headers: headers

        expect(response).to have_http_status(200)
        expect(task.reload.status).to eq('completed')
      end
    end

    context 'when only attributes are provided' do
      it 'updates title and due_date but leaves status untouched' do
        put "/tasks/#{task.id}",
            params: { task: { title: new_title, due_date: new_due_date } },
            headers: headers

        expect(response).to have_http_status(200)
        reloaded = task.reload
        expect(reloaded.title).to eq(new_title)
        expect(reloaded.due_date.iso8601).to eq(new_due_date)
        expect(reloaded.status).to eq('pending')
      end
    end

    context 'when both status and other attributes are provided' do
      it 'updates both in a single request' do
        put "/tasks/#{task.id}",
            params: { task: { title: new_title, status: 'in_progress', due_date: new_due_date } },
            headers: headers

        expect(response).to have_http_status(200)
        reloaded = task.reload
        expect(reloaded.title).to eq(new_title)
        expect(reloaded.due_date.iso8601).to eq(new_due_date)
        expect(reloaded.status).to eq('in_progress')
      end
    end

    context 'with an invalid status value' do
      it 'returns a 422 and does not change anything' do
        original_attrs = task.attributes.slice('title', 'status', 'due_date')
        
        put "/tasks/#{task.id}",
            params: { task: { status: 'not_a_state', title: 'Won’t apply' } },
            headers: headers

        expect(response).to have_http_status(422)
        reloaded = task.reload
        expect(reloaded.attributes.slice('title', 'status', 'due_date')).to eq(original_attrs)
      end
    end
  end

  describe 'DELETE /tasks/:id' do
    it 'deletes the task' do
      expect {
        delete "/tasks/#{task.id}", headers: headers
      }.to change(user.tasks, :count).by(-1)
      expect(response).to have_http_status(204)
    end
  end
end
