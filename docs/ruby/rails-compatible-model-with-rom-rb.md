---
layout: default
title: Rails compatible model with rom-rb
date: 2021-04-25
parent: Ruby
---

# Rails compatible model with rom-rb

[Ruby Object Mapper](https://rom-rb.org/){:target="_blank"} is an excellent Ruby gem implementing [data mapper pattern](https://en.wikipedia.org/wiki/Data_mapper_pattern){:target="_blank"}. It can be used instead of / alongside `ActiveRecord` library in the Ruby on Rails applications (`rom-rb` website provides [instructions how to set it up in the existing Rails application](https://rom-rb.org/learn/rails/2.2/){:target="_blank"}).

The Rails framework, already comes with built-in helpers (`form_with`, `text_field`, etc.) to help with scaffolding HTML forms powered by `ActiveRecord` models. Turns out, those helpers are not reserved to work with `ActiveRecord` models only - they work with any objects that implement a specific set of methods.

Let's start with defining a base class for all repositories in the application:

```ruby
# app/repositories/application_repository.rb
class ApplicationRepository < ROM::Repository::Root
  auto_struct true

  struct_namespace ::Entities

  def find(id)
    root.by_pk(id).one!
  end
end
```

- `auto_struct` specifies whether relation tuples should be transformed into struct objects 
- `struct_namespace` provides a namespace where for all those struct objects leave

Now, let's define a base class for all entities:

```ruby
class Entity < ROM::Struct
  extend ActiveModel::Naming
  include ActiveModel::Conversion

  def self.inherited(klass)
    super

    klass.transform_types { |t| t.omittable }
  end

  def self.model_name
    ActiveModel::Name.new(self, nil, name.demodulize)
  end
end
```

[ActiveModel::Naming](https://api.rubyonrails.org/classes/ActiveModel/Naming.html){:target="_blank"} includes methods (`model_name`, `param_key`, `route_key`, etc.) to use the object with `form_with` and `redirect_to` helpers. [ActiveMode::Convertions](https://api.rubyonrails.org/classes/ActiveModel/Conversion.html){:target="_blank"} adds a few extra ones (`to_key`, `to_param`) for routing parameters, and partial paths.

`klass.transform_types { |t| t.omittable }` modifies extending class to make all attributes (inferred from a database schema or specified manually) optional when creating a new class instance - without that `Entities::MyEntity.new` will raise `Dry::Struct::Error`, and it will complain about missing attributes.

We also override `model_name` as described [here]({% link docs/ruby/overriding-model-name-in-rails.md %}) to exclude `entities` from method names (i.e. `project_path` instead of `entities_project_path`) used to generate paths and URLs for the entities.

Now our existing entities (extending from the base `Entity` class) can be used with Rails form helpers. For non-persisted ones (used by `new` action in the controller), we need to add one more extra method to our `ApplicationRepository` class:

```ruby
# app/repositories/application_repository.rb
class ApplicationRepository < ROM::Repository::Root
  ...

  def build(attributes = {})
    root.mapper.model.new(attributes)
  end
end
```

`root.mapper.model` returns a class that was generated by repository based on one of the `Entitites::` class. Keep in mind, it's not a simple inheritance - `Entities::Project` instance returned by `ProjectRepository#find` method, is not an exact instance of `Entities::Project` class from `app/models/entities` directory, but another class (with the same name) built on top of it - check this example:

```
pry(main)> repo = ProjectRepository.new(ROM.env)
=> #<ProjectRepository struct_namespace=Entities auto_struct=true>
pry(main)> p = repo.find(1)
  ROM[postgres] (0.9ms)  SELECT "projects"."id", "projects"."name" FROM "projects" WHERE ("projects"."id" = 1) ORDER BY "projects"."id"
=> #<Entities::Project id=1 name="Test after update">
pry(main)> p.instance_of?(Entities::Project)
=> false
pry(main)> p.is_a?(Entities::Project)
=> true
pry(main)> p.class.ancestors
=> [Entities::Project,
 Entities::Project,
 Entity,
 ActiveModel::Conversion,
 ROM::Struct,
 Dry::Struct,
 Dry::Core::Equalizer::Methods,
 #<Dry::Core::Equalizer:0x000056462808edb8>,
 Dry::Core::Constants,
 ActiveSupport::Dependencies::ZeitwerkIntegration::RequireDependency,
 ActiveSupport::ForkTracker::CoreExtPrivate,
 ActiveSupport::ForkTracker::CoreExt,
 ActiveSupport::ToJsonWithActiveSupportEncoder,
 Object,
 PP::ObjectMixin,
 JSON::Ext::Generator::GeneratorMethods::Object,
 ActiveSupport::Dependencies::Loadable,
 ActiveSupport::Tryable,
 Kernel,
 BasicObject]
```

We can't just call `Entities::Project.new(id: 1)` as the base struct is not aware of the attributes it should have (those are inferred from the schema, and incorporated into the final class that is generated by the repository), we have to use `Repository#build` method instead, i.e.

```ruby
class ProjectsController < ApplicationController
  def index
    render :index, locals: { projects: projects.all }
  end

  def new
    @project = repo.build
    render :new
  end

  def edit
    @project = repo.find(params[:id])
  end

  def create
    project = repo.create(project_params)
    if project
      redirect_to project
    else
      @project = repo.build(project_params)
      render :new
    end
  end

  def update
    project = repo.update(params[:id], project_params)
    if project
      redirect_to project
    else
      @project = repo.build(project_params)
      render :edit
    end
  end

  private

  def repo
    @repo ||= ProjectRepository.new(rom)
  end

  def project_params
    params.require(:project).permit(:name).to_h.symbolize_keys
  end
end
```

*Treat it more like a sudo code example, rather than production-ready solution as it lacks proper validation,
authentication, and authorization*