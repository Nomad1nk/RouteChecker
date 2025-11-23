Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  # API V1 Routes
  namespace :api do
    namespace :v1 do
      post 'routes/optimize', to: 'routes#optimize'
    end
  end
end