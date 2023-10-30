version_settings(constraint='>=0.32.0')
load('ext://secret', 'secret_from_dict')
load('ext://configmap', 'configmap_create')
load('ext://helm_remote', 'helm_remote')
load('ext://git_resource', 'git_checkout')

# Custom config setup
cfg = decode_json(read_file('tilt_config.json'))

# Load env file configurations to a Starlark dictionary.

update_settings(max_parallel_updates=2)

def loadEnvToDict(fn='.env'):
    f = read_file(fn)
    lines = str(f).splitlines()
    dict = {}
    for line in lines:
        v = line.split('=', 1)
        if len(v) < 2:
            continue
        dict |= {v[0]: v[1]}
    return dict

# Generates port fowarding for each config entry


def portFowarding(fw=[{}]):
    ports = []
    for port in fw:
        ports.append(port_forward(
            port['local'], port['container'], name=port['name']))
    return ports

# Generates launch json config for each repository


def debuggerConfig(port='9229', path='', repository='', type='nest', workspace=True):
    if (type == 'nest'):
        return {
            "type": "node",
            "request": "attach",
            "name": "Debug " + repository,
            "address": "localhost",
            "port": port,
            "sourceMaps": True,
            "restart": True,
            "localRoot": "${workspaceFolder}" + path.removeprefix('..') if workspace else "${workspaceFolder}",
            "remoteRoot": "/usr/src/app"
        }
    else:
        return {
            "type": "chrome",
            "request": "launch",
            "name": "Debug " + repository,
            "url": "http://localhost:" + str(port),
            "runtimeExecutable": "stable",
            "webRoot": "${workspaceFolder}" + path.removeprefix('..') if workspace else "${workspaceFolder}",
            "sourceMaps": True,
        }

# MySQL Setup
helm_remote('mysql',
            repo_name='bitnami',
            repo_url='https://charts.bitnami.com/bitnami', set=["auth.rootPassword=masterkey"])
k8s_resource(workload='mysql', port_forwards=[
    port_forward(3306, 3306, name='Client connection'),
], labels=["Extra"])

workspaceLaunchJson = {
    "version": "0.2.0",
    "configurations": []
}

for i, repository in enumerate(cfg["repositories"]):
    workspaceLaunchJson['configurations'].append(debuggerConfig(
        port=9229+i if cfg["repositories"][repository]['type'] == 'nest' else cfg["repositories"][repository]['port_forwards'][0]['local'], repository=repository, path=cfg["repositories"][repository]['path'], type=cfg["repositories"][repository]['type'], workspace=True))
    yaml = read_yaml_stream(cfg["repositories"][repository]['manifestFile'])
    deployment = ''
    for o in yaml:
        # Save deployment name and remove resource limitations from dev
        if (o['kind'] == 'Deployment'):
            deployment = o['metadata']['name']
            o["spec"]["template"]["spec"]["containers"][0]["resources"] = None

    envs = loadEnvToDict(cfg["repositories"][repository]["path"] + '/.env')
    # Load the development envs into both kubernetes secrets and configmap
    for index, o in enumerate(yaml):
        if (o['kind'] == 'ConfigMap'):
            configmap = o['metadata']['name']
            for e in envs.keys():
                if (e in o['data']):
                    o['data'] |= {e: envs[e]}
        if (o['kind'] == 'Secret'):
            secret = o['metadata']['name']
            for e in envs.keys():
                if (e in o['data']):
                    o['data'] |= {
                        e: str(local('echo -n ' + envs[e] + '| base64 -w 0', echo_off=True, quiet=True))}

    # Build the initial repository docker with live update and caching
    docker_build(
        "nestjs-knex-example",
        context=cfg["repositories"][repository]["path"],
        build_args=envs,
        dockerfile="Dockerfile",
        live_update=[
            sync(cfg["repositories"][repository]["path"], '/usr/src/app'),
            run('cd /usr/src/app && yarn install', trigger=[cfg["repositories"][repository]["path"] + '/package.json',
                cfg["repositories"][repository]["path"] + '/yarn.lock', cfg["repositories"][repository]["path"] + '/.env']),
        ],
        entrypoint=cfg["repositories"][repository]["entrypoint"] if cfg[
            "repositories"][repository]["entrypoint"] else "yarn start:dev"
    )
    # Write a debug config file to each repository
    isolatedLaunchJson = {
        "version": "0.2.0",
        "configurations": [
            debuggerConfig(
                port=9229+i if cfg["repositories"][repository]['type'] == 'nest' else cfg["repositories"][repository]['port_forwards'][0]['local'], repository=repository, path=cfg["repositories"][repository]['path'], type=cfg["repositories"][repository]['type'], workspace=False)
        ]
    }
    local('cd ' + cfg["repositories"][repository]['path'] + ' && mkdir -p .vscode && echo "$CONTENTS" > .vscode/launch.json',
            env={'CONTENTS': encode_json(isolatedLaunchJson)}, echo_off=True, quiet=True)
    # Encode the custom generated YAML and apply it to the cluster.
    k8s_yaml([
        encode_yaml_stream(yaml),
    ])

    # Add the resource to tilt and foward it's ports.
    k8s_resource(deployment, port_forwards=[port_forward(9229+i, 9229, name="Debugger")] + portFowarding(cfg["repositories"][repository]['port_forwards'])
                 if cfg["repositories"][repository]['port_forwards'] else [port_forward(9229+i, 9229, name="Debugger")], labels=cfg["repositories"][repository]['labels'])

# Write a debug config file to the workspace
local('cd .. && mkdir -p .vscode && echo "$CONTENTS" > .vscode/launch.json',
      env={'CONTENTS': encode_json(workspaceLaunchJson)}, echo_off=True, quiet=True)