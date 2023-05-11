# frozen_string_literal: true

module I18n
  class Middleware

    def initialize(server)
      @server = server
    end

    def call(env)
      @server.call(env)
    ensure
      Thread.current[:i18n_config] = I18n::Config.new
    end

  end
end
