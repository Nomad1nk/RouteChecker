require 'net/http'
require 'json'

module Api
  module V1
    class RoutesController < ApplicationController
      def optimize
        payload = {
          origin: params[:origin],
          destination: params[:destination],
          stops: params[:stops] || []
        }

        begin
          uri = URI('http://127.0.0.1:5001/optimize')
          http = Net::HTTP.new(uri.host, uri.port)
          request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
          request.body = payload.to_json

          response = http.request(request)

          render json: JSON.parse(response.body), status: response.code

        rescue StandardError => e
          render json: { error: "Could not connect to Optimization Engine. Is Python running on 5001?" }, status: 503
        end
      end
    end
  end
end