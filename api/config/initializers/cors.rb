# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # in development, allow your Angular app:
    origins 'http://localhost:4200'
    # in production, lock this down to your real domain(s):
    # origins 'https://myapp.example.com'

    resource '*',
      headers: :any,                       # let Angular send any headers
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true                    # if you need to send cookies/auth
  end
end
