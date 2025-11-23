require 'net/http'
require 'json'

module Api
  module V1
    class RoutesController < ApplicationController
      def optimize
        # 1. Prepare data for the Python "Brain"
        # We take the data coming from the Frontend (params)
        payload = {
          origin: params[:origin],
          destination: params[:destination],
          stops: params[:stops] || []
        }

        # 2. TALK TO PYTHON (Service A)
        # We send a POST request to localhost:5001 where Python is running
        begin
          uri = URI('http://127.0.0.1:5001/optimize')
          http = Net::HTTP.new(uri.host, uri.port)
          request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
          request.body = payload.to_json

          # Send the request and get the response
          response = http.request(request)

          # 3. Return the answer to the User
          # We just pass along whatever the Python brain calculated
          render json: JSON.parse(response.body), status: response.code

        rescue StandardError => e
          # If Python is dead or not running
          render json: { error: "Could not connect to Optimization Engine. Is Python running on 5001?" }, status: 503
        end
      end
    end
  end
end