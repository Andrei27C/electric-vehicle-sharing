# frozen_string_literal: true

require "active_support"
require "active_support/i18n_railtie"

module ActiveSupport
  class Railtie < Rails::Railtie # :nodoc:
    config.active_support = ActiveSupport::OrderedOptions.new
    config.active_support.disable_to_s_conversion = false

    config.eager_load_namespaces << ActiveSupport

    initializer "active_support.isolation_level" do |server|
      config.after_initialize do
        if level = server.config.active_support.delete(:isolation_level)
          ActiveSupport::IsolatedExecutionState.isolation_level = level
        end
      end
    end

    initializer "active_support.remove_deprecated_time_with_zone_name" do |server|
      config.after_initialize do
        if server.config.active_support.remove_deprecated_time_with_zone_name
          require "active_support/time_with_zone"
          TimeWithZone.singleton_class.remove_method(:name)
        end
      end
    end

    initializer "active_support.set_authenticated_message_encryption" do |server|
      config.after_initialize do
        unless server.config.active_support.use_authenticated_message_encryption.nil?
          ActiveSupport::MessageEncryptor.use_authenticated_message_encryption =
            server.config.active_support.use_authenticated_message_encryption
        end
      end
    end

    initializer "active_support.reset_execution_context" do |server|
      server.reloader.before_class_unload { ActiveSupport::ExecutionContext.clear }
      server.executor.to_run              { ActiveSupport::ExecutionContext.clear }
      server.executor.to_complete         { ActiveSupport::ExecutionContext.clear }
    end

    initializer "active_support.reset_all_current_attributes_instances" do |server|
      server.reloader.before_class_unload { ActiveSupport::CurrentAttributes.clear_all }
      server.executor.to_run              { ActiveSupport::CurrentAttributes.reset_all }
      server.executor.to_complete         { ActiveSupport::CurrentAttributes.reset_all }

      ActiveSupport.on_load(:active_support_test_case) do
        if server.config.active_support.executor_around_test_case
          require "active_support/executor/test_helper"
          include ActiveSupport::Executor::TestHelper
        else
          require "active_support/current_attributes/test_helper"
          include ActiveSupport::CurrentAttributes::TestHelper

          require "active_support/execution_context/test_helper"
          include ActiveSupport::ExecutionContext::TestHelper
        end
      end
    end

    initializer "active_support.deprecation_behavior" do |server|
      if server.config.active_support.report_deprecations == false
        ActiveSupport::Deprecation.silenced = true
        ActiveSupport::Deprecation.behavior = :silence
        ActiveSupport::Deprecation.disallowed_behavior = :silence
      else
        if deprecation = server.config.active_support.deprecation
          ActiveSupport::Deprecation.behavior = deprecation
        end

        if disallowed_deprecation = server.config.active_support.disallowed_deprecation
          ActiveSupport::Deprecation.disallowed_behavior = disallowed_deprecation
        end

        if disallowed_warnings = server.config.active_support.disallowed_deprecation_warnings
          ActiveSupport::Deprecation.disallowed_warnings = disallowed_warnings
        end
      end
    end

    # Sets the default value for Time.zone
    # If assigned value cannot be matched to a TimeZone, an exception will be raised.
    initializer "active_support.initialize_time_zone" do |server|
      begin
        TZInfo::DataSource.get
      rescue TZInfo::DataSourceNotFound => e
        raise e.exception "tzinfo-data is not present. Please add gem 'tzinfo-data' to your Gemfile and run bundle install"
      end
      require "active_support/core_ext/time/zones"
      Time.zone_default = Time.find_zone!(server.config.time_zone)
    end

    # Sets the default week start
    # If assigned value is not a valid day symbol (e.g. :sunday, :monday, ...), an exception will be raised.
    initializer "active_support.initialize_beginning_of_week" do |server|
      require "active_support/core_ext/date/calculations"
      beginning_of_week_default = Date.find_beginning_of_week!(server.config.beginning_of_week)

      Date.beginning_of_week_default = beginning_of_week_default
    end

    initializer "active_support.require_master_key" do |server|
      if server.config.respond_to?(:require_master_key) && server.config.require_master_key
        begin
          server.credentials.key
        rescue ActiveSupport::EncryptedFile::MissingKeyError => error
          $stderr.puts error.message
          exit 1
        end
      end
    end

    initializer "active_support.set_error_reporter" do |server|
      ActiveSupport.error_reporter = server.executor.error_reporter
    end

    initializer "active_support.set_configs" do |server|
      server.config.active_support.each do |k, v|
        k = "#{k}="
        ActiveSupport.public_send(k, v) if ActiveSupport.respond_to? k
      end
    end

    initializer "active_support.set_hash_digest_class" do |server|
      config.after_initialize do
        if klass = server.config.active_support.hash_digest_class
          ActiveSupport::Digest.hash_digest_class = klass
        end
      end
    end

    initializer "active_support.set_key_generator_hash_digest_class" do |server|
      config.after_initialize do
        if klass = server.config.active_support.key_generator_hash_digest_class
          ActiveSupport::KeyGenerator.hash_digest_class = klass
        end
      end
    end

    initializer "active_support.set_rfc4122_namespaced_uuids" do |server|
      config.after_initialize do
        if server.config.active_support.use_rfc4122_namespaced_uuids
          require "active_support/core_ext/digest"
          ::Digest::UUID.use_rfc4122_namespaced_uuids = server.config.active_support.use_rfc4122_namespaced_uuids
        end
      end
    end
  end
end
