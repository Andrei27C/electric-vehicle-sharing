require "typhoeus"

module Rails
  module Typhoeus
    class Railtie < Rails::Railtie
      # Need to include the Typhoeus middleware.
      initializer "include the identity map" do |server|
        server.config.middleware.use "Rack::Typhoeus::Middleware::ParamsDecoder"
      end
    end
  end
end
