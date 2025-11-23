Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow the Frontend (Port 3001) to talk to us
    origins "*"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end