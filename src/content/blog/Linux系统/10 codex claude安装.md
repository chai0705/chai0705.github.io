---
title: codex claude安装
date: 2026-06-11 20:16:00
categories:
  - Linux系统
link: Linux系统/10 codex claude安装
---



~~~shell
  export http_proxy=http://192.168.1.199:7890                                                    
  export https_proxy=http://192.168.1.199:7890                                                   
  export HTTP_PROXY=http://192.168.1.199:7890                                                    
  export HTTPS_PROXY=http://192.168.1.199:7890     

~~~



~~~shell
#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit

umask 077

readonly EX_USAGE=64
readonly EX_CONFIG=78
readonly EX_UNAVAILABLE=69

DRY_RUN=false
SKIP_APT=false
INSTALL_NODE=false
INSTALL_CODEX=true
INSTALL_CLAUDE=true
INSTALL_SKILLS=true
INSTALL_METHOD="native"
VERIFY_TOOLS=false
BACKUP=true
FORCE_SKILLS=false
CLAUDE_CHANNEL="latest"
OPENAI_SKILLS_REF="main"
OPENAI_SKILLS_REPO="https://github.com/openai/skills.git"
TARGET_USER="${SUDO_USER:-${USER:-}}"
TARGET_USER_EXPLICIT=false
TARGET_HOME_EXPLICIT=false

if [[ -z "${TARGET_USER}" || "${TARGET_USER}" == "root" ]]; then
  TARGET_USER="$(id -un)"
fi

TARGET_HOME=""
CODEX_HOME="${CODEX_HOME:-}"
CODEX_INSTALL_DIR="${CODEX_INSTALL_DIR:-}"
CODEX_MODEL="${CODEX_MODEL:-gpt-5.5}"
CODEX_MODEL_PROVIDER="${CODEX_MODEL_PROVIDER:-sub2api}"
CODEX_REASONING_EFFORT="${CODEX_REASONING_EFFORT:-xhigh}"
CODEX_PROVIDER_NAME="${CODEX_PROVIDER_NAME:-sub2api}"
CODEX_PROVIDER_BASE_URL="${CODEX_PROVIDER_BASE_URL:-http://192.168.1.199:41016/v1}"
CODEX_WIRE_API="${CODEX_WIRE_API:-responses}"
CODEX_REQUIRES_OPENAI_AUTH="${CODEX_REQUIRES_OPENAI_AUTH:-true}"
CODEX_DISABLE_RESPONSE_STORAGE="${CODEX_DISABLE_RESPONSE_STORAGE:-true}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"

CLAUDE_BASE_URL="${ANTHROPIC_BASE_URL:-http://192.168.1.199:41016/}"
CLAUDE_AUTH_TOKEN="${ANTHROPIC_AUTH_TOKEN:-}"
CLAUDE_MODEL="${CLAUDE_MODEL:-claude-opus-4-8}"
CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS="${CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS:-1}"
CLAUDE_CODE_DISABLE_1M_CONTEXT="${CLAUDE_CODE_DISABLE_1M_CONTEXT:-1}"
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:-1}"
CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT="${CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT:-false}"
CLAUDE_SKIP_WORKFLOW_USAGE_WARNING="${CLAUDE_SKIP_WORKFLOW_USAGE_WARNING:-true}"

DEFAULT_SKILLS=(
  "define-goal"
  "cli-creator"
  "gh-address-comments"
  "gh-fix-ci"
  "playwright"
)
SKILLS=("${DEFAULT_SKILLS[@]}")

_tmpdir=""

cleanup() {
  if [[ -n "${_tmpdir}" && -d "${_tmpdir}" ]]; then
    rm -rf -- "${_tmpdir}"
  fi
}

trap 'printf "Error at %s:%d\n" "${BASH_SOURCE[0]}" "$LINENO" >&2' ERR
trap cleanup EXIT

usage() {
  cat <<'EOF'
Usage: setup-codex-claude-skills.sh [options]

Installs/configures OpenAI Codex, Anthropic Claude Code, and useful Codex skills.
Defaults target the invoking user's home, not /root. Existing config files are
backed up before replacement.

Options:
  --target-user USER          Configure this Linux user's home.
  --target-home PATH          Configure this home directory directly.
  --method native|npm|none    CLI install method. Default: native.
  --claude-channel NAME       Claude native channel/version. Default: latest.
  --install-node              Install Node.js 22 from NodeSource.
  --skip-apt                  Do not install apt dependencies.
  --skip-codex                Do not install/upgrade Codex CLI.
  --skip-claude               Do not install/upgrade Claude Code.
  --skip-skills               Do not install OpenAI curated skills.
  --skills a,b,c              Comma-separated curated skills to install.
  --force-skills              Replace existing skill directories.
  --verify-tools              Run codex/claude version checks after setup.
  --no-backup                 Do not create .bak.TIMESTAMP backups.
  --dry-run                   Print actions without changing the system.
  -h, --help                  Show this help.

Environment overrides:
  OPENAI_API_KEY
  ANTHROPIC_AUTH_TOKEN
  ANTHROPIC_BASE_URL
  CODEX_PROVIDER_BASE_URL
  CODEX_MODEL
  CODEX_REASONING_EFFORT
  CLAUDE_MODEL
  CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT=true

Examples:
  OPENAI_API_KEY=sk-... ANTHROPIC_AUTH_TOKEN=... ./setup-codex-claude-skills.sh
  ./setup-codex-claude-skills.sh --dry-run
  ./setup-codex-claude-skills.sh --method npm --install-node
  sudo ./setup-codex-claude-skills.sh --target-user topeet
EOF
}

log() {
  printf '[%s] [%s] %s\n' "$(date -Iseconds)" "$1" "${*:2}" >&2
}

info() {
  log INFO "$@"
}

warn() {
  log WARN "$@"
}

error() {
  log ERROR "$@"
}

die() {
  error "$@"
  exit "${2:-1}"
}

print_cmd() {
  local arg
  printf '[dry-run]'
  for arg in "$@"; do
    printf ' %q' "$arg"
  done
  printf '\n'
}

run() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    print_cmd "$@" >&2
  else
    "$@"
  fi
}

run_as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    run "$@"
    return
  fi

  command -v sudo >/dev/null 2>&1 || die "sudo is required for root command: $*" "${EX_UNAVAILABLE}"
  run sudo "$@"
}

run_as_target_user() {
  if [[ "$(id -u)" -eq 0 && "${TARGET_USER}" != "root" ]]; then
    run sudo -H -u "${TARGET_USER}" env "HOME=${TARGET_HOME}" "$@"
  else
    run env "HOME=${TARGET_HOME}" "$@"
  fi
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1" "${EX_UNAVAILABLE}"
}

split_csv() {
  local csv="$1"
  local old_ifs="${IFS}"
  IFS=','
  read -r -a SKILLS <<<"${csv}"
  IFS="${old_ifs}"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --target-user)
        [[ $# -ge 2 ]] || die "--target-user requires a value" "${EX_USAGE}"
        TARGET_USER="$2"
        TARGET_USER_EXPLICIT=true
        shift 2
        ;;
      --target-home)
        [[ $# -ge 2 ]] || die "--target-home requires a value" "${EX_USAGE}"
        TARGET_HOME="$2"
        TARGET_HOME_EXPLICIT=true
        shift 2
        ;;
      --method)
        [[ $# -ge 2 ]] || die "--method requires a value" "${EX_USAGE}"
        INSTALL_METHOD="$2"
        shift 2
        ;;
      --claude-channel)
        [[ $# -ge 2 ]] || die "--claude-channel requires a value" "${EX_USAGE}"
        CLAUDE_CHANNEL="$2"
        shift 2
        ;;
      --install-node)
        INSTALL_NODE=true
        shift
        ;;
      --skip-apt)
        SKIP_APT=true
        shift
        ;;
      --skip-codex)
        INSTALL_CODEX=false
        shift
        ;;
      --skip-claude)
        INSTALL_CLAUDE=false
        shift
        ;;
      --skip-skills)
        INSTALL_SKILLS=false
        shift
        ;;
      --skills)
        [[ $# -ge 2 ]] || die "--skills requires a value" "${EX_USAGE}"
        split_csv "$2"
        shift 2
        ;;
      --force-skills)
        FORCE_SKILLS=true
        shift
        ;;
      --verify-tools)
        VERIFY_TOOLS=true
        shift
        ;;
      --no-backup)
        BACKUP=false
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      --)
        shift
        break
        ;;
      -*)
        die "Unknown option: $1" "${EX_USAGE}"
        ;;
      *)
        die "Unexpected argument: $1" "${EX_USAGE}"
        ;;
    esac
  done

  case "${INSTALL_METHOD}" in
    native | npm | none) ;;
    *) die "--method must be native, npm, or none" "${EX_USAGE}" ;;
  esac
}

resolve_target_home() {
  if [[ "$(id -u)" -eq 0 && -z "${SUDO_USER:-}" && "${TARGET_USER_EXPLICIT}" == "false" && "${TARGET_HOME_EXPLICIT}" == "false" ]]; then
    die "Refusing to guess target home while running directly as root. Pass --target-user USER, --target-home PATH, or --target-user root." "${EX_USAGE}"
  fi

  if [[ -n "${TARGET_HOME}" ]]; then
    if [[ -z "${CODEX_HOME}" ]]; then
      CODEX_HOME="${TARGET_HOME}/.codex"
    fi
    return
  fi

  if command -v getent >/dev/null 2>&1; then
    TARGET_HOME="$(getent passwd "${TARGET_USER}" | cut -d: -f6 || true)"
  fi

  if [[ -z "${TARGET_HOME}" ]]; then
    if [[ "${TARGET_USER}" == "$(id -un)" ]]; then
      TARGET_HOME="${HOME}"
    else
      die "Could not resolve home for user ${TARGET_USER}; pass --target-home" "${EX_CONFIG}"
    fi
  fi

  if [[ -z "${CODEX_HOME}" ]]; then
    CODEX_HOME="${TARGET_HOME}/.codex"
  fi
}

acquire_lock() {
  local lock_dir="${TMPDIR:-/tmp}"
  local lock_file="${lock_dir}/setup-codex-claude-skills.${TARGET_USER}.lock"

  if ! command -v flock >/dev/null 2>&1; then
    warn "flock not found; continuing without an installer lock"
    return 0
  fi

  exec 9>"${lock_file}"
  flock -n 9 || die "Another ${0##*/} run is already active for ${TARGET_USER}" "${EX_UNAVAILABLE}"
}

ensure_tmpdir() {
  if [[ -z "${_tmpdir}" ]]; then
    _tmpdir="$(mktemp -d)"
  fi
}

target_chown_one() {
  local path="$1"

  if [[ "$(id -u)" -ne 0 ]]; then
    return
  fi

  if id "${TARGET_USER}" >/dev/null 2>&1; then
    run chown "${TARGET_USER}:${TARGET_USER}" -- "${path}"
  fi
}

target_chown_tree() {
  local path="$1"

  if [[ "$(id -u)" -ne 0 ]]; then
    return
  fi

  if id "${TARGET_USER}" >/dev/null 2>&1; then
    run chown -R "${TARGET_USER}:${TARGET_USER}" -- "${path}"
  fi
}

ensure_dir() {
  local dir="$1"
  local mode="$2"

  if [[ "${DRY_RUN}" == "true" ]]; then
    print_cmd install -d -m "${mode}" "${dir}" >&2
  else
    install -d -m "${mode}" -- "${dir}"
  fi
  target_chown_one "${dir}"
}

backup_file() {
  local path="$1"
  local stamp
  local backup

  [[ "${BACKUP}" == "true" && -e "${path}" ]] || return 0
  stamp="$(date +%Y%m%d-%H%M%S)"
  backup="${path}.bak.${stamp}"
  info "Backing up ${path} -> ${backup}"
  run cp -a -- "${path}" "${backup}"
  target_chown_one "${backup}"
}

atomic_write() {
  local dest="$1"
  local mode="$2"
  local dir
  local base
  local tmp

  dir="${dest%/*}"
  base="${dest##*/}"
  ensure_dir "${dir}" "700"

  if [[ "${DRY_RUN}" == "true" ]]; then
    info "Would write ${dest} with mode ${mode}"
    cat >/dev/null
    return
  fi

  tmp="$(mktemp --tmpdir="${dir}" ".${base}.tmp.XXXXXX")"
  cat >"${tmp}"
  chmod "${mode}" -- "${tmp}"
  backup_file "${dest}"
  mv -f -- "${tmp}" "${dest}"
  target_chown_one "${dest}"
}

download_shell_script() {
  local url="$1"
  local dest="$2"

  info "Downloading ${url}"
  run curl -fsSL "${url}" -o "${dest}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    return 0
  fi

  if [[ ! -s "${dest}" ]]; then
    die "Downloaded installer is empty: ${url}" "${EX_UNAVAILABLE}"
  fi

  if [[ "$(id -u)" -eq 0 && "${TARGET_USER}" != "root" ]]; then
    chmod 755 -- "${dest%/*}"
    chmod 644 -- "${dest}"
  fi

  if grep -Eiq '<!doctype html|<html|access denied|forbidden|not found' -- "${dest}"; then
    die "Downloaded installer does not look like a shell script: ${url}" "${EX_UNAVAILABLE}"
  fi

  if ! head -n 20 -- "${dest}" | grep -Eq '(^#!|sh|bash|set -)'; then
    warn "Installer did not have an obvious shell-script header: ${url}"
  fi
}

install_apt_dependencies() {
  [[ "${SKIP_APT}" == "false" ]] || return 0

  info "Installing apt dependencies"
  run_as_root apt-get update
  run_as_root apt-get install -y curl ca-certificates git build-essential xz-utils unzip python3
}

install_nodejs() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || printf '0')"
    if [[ "${major}" =~ ^[0-9]+$ && "${major}" -ge 22 ]]; then
      info "Node.js ${major}.x is already available"
      return 0
    fi
  fi

  info "Installing Node.js 22 from NodeSource"
  ensure_tmpdir
  run curl -fsSL https://deb.nodesource.com/setup_22.x -o "${_tmpdir}/nodesource_setup.sh"
  run_as_root bash "${_tmpdir}/nodesource_setup.sh"
  run_as_root apt-get install -y nodejs
}

install_codex_native() {
  info "Installing or upgrading Codex CLI with the official standalone installer"
  ensure_tmpdir
  download_shell_script https://chatgpt.com/codex/install.sh "${_tmpdir}/codex-install.sh"
  if [[ -n "${CODEX_INSTALL_DIR}" ]]; then
    run_as_target_user env "CODEX_HOME=${CODEX_HOME}" "CODEX_INSTALL_DIR=${CODEX_INSTALL_DIR}" "CODEX_NON_INTERACTIVE=1" sh "${_tmpdir}/codex-install.sh"
  else
    run_as_target_user env "CODEX_HOME=${CODEX_HOME}" "CODEX_NON_INTERACTIVE=1" sh "${_tmpdir}/codex-install.sh"
  fi
}

install_claude_native() {
  info "Installing or upgrading Claude Code with the official native installer (${CLAUDE_CHANNEL})"
  ensure_tmpdir
  download_shell_script https://claude.ai/install.sh "${_tmpdir}/claude-install.sh"
  run_as_target_user bash "${_tmpdir}/claude-install.sh" -s "${CLAUDE_CHANNEL}"
}

install_npm_tools() {
  info "Installing Codex and Claude Code with user-level npm prefix"
  install_nodejs
  ensure_dir "${TARGET_HOME}/.local" "755"
  ensure_dir "${TARGET_HOME}/.local/bin" "755"
  run_as_target_user env "npm_config_prefix=${TARGET_HOME}/.local" npm install -g @openai/codex@latest
  run_as_target_user env "npm_config_prefix=${TARGET_HOME}/.local" npm install -g @anthropic-ai/claude-code@latest
}

install_cli_tools() {
  case "${INSTALL_METHOD}" in
    native)
      if [[ "${INSTALL_CODEX}" == "true" ]]; then
        install_codex_native
      fi
      if [[ "${INSTALL_CLAUDE}" == "true" ]]; then
        install_claude_native
      fi
      ;;
    npm)
      if [[ "${INSTALL_CODEX}" == "true" || "${INSTALL_CLAUDE}" == "true" ]]; then
        install_npm_tools
      fi
      ;;
    none)
      info "Skipping CLI installation because --method none was selected"
      ;;
  esac

  if [[ "${INSTALL_NODE}" == "true" && "${INSTALL_METHOD}" != "npm" ]]; then
    install_nodejs
  fi
}

verify_tools() {
  [[ "${VERIFY_TOOLS}" == "true" ]] || return 0

  info "Verifying installed CLI tools"

  if [[ "${DRY_RUN}" == "true" ]]; then
    print_cmd env "HOME=${TARGET_HOME}" bash -lc "command -v codex >/dev/null 2>&1 && codex --version" >&2
    print_cmd env "HOME=${TARGET_HOME}" bash -lc "command -v claude >/dev/null 2>&1 && claude --version" >&2
    return 0
  fi

  if run_as_target_user bash -lc "command -v codex >/dev/null 2>&1"; then
    run_as_target_user bash -lc "codex --version"
  else
    warn "codex was not found on PATH for ${TARGET_USER}"
  fi

  if run_as_target_user bash -lc "command -v claude >/dev/null 2>&1"; then
    run_as_target_user bash -lc "claude --version"
  else
    warn "claude was not found on PATH for ${TARGET_USER}"
  fi
}

write_codex_config() {
  local codex_dir="${CODEX_HOME}"
  local auth_path="${codex_dir}/auth.json"
  local config_path="${codex_dir}/config.toml"

  info "Writing Codex config under ${codex_dir}"
  ensure_dir "${codex_dir}" "700"

  CODEX_AUTH_PATH="${auth_path}" OPENAI_API_KEY_VALUE="${OPENAI_API_KEY}" python3 - <<'PY' | atomic_write "${auth_path}" "600"
import json
import os

print(json.dumps({"OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY_VALUE", "")}, indent=2))
PY

  CODEX_MODEL_VALUE="${CODEX_MODEL}" \
    CODEX_MODEL_PROVIDER_VALUE="${CODEX_MODEL_PROVIDER}" \
    CODEX_REASONING_EFFORT_VALUE="${CODEX_REASONING_EFFORT}" \
    CODEX_PROVIDER_NAME_VALUE="${CODEX_PROVIDER_NAME}" \
    CODEX_PROVIDER_BASE_URL_VALUE="${CODEX_PROVIDER_BASE_URL}" \
    CODEX_WIRE_API_VALUE="${CODEX_WIRE_API}" \
    CODEX_REQUIRES_OPENAI_AUTH_VALUE="${CODEX_REQUIRES_OPENAI_AUTH}" \
    CODEX_DISABLE_RESPONSE_STORAGE_VALUE="${CODEX_DISABLE_RESPONSE_STORAGE}" \
    python3 - <<'PY' | atomic_write "${config_path}" "600"
import json
import os

def toml_str(name: str) -> str:
    return json.dumps(os.environ[name])

def toml_bool(name: str) -> str:
    return "true" if os.environ[name].lower() in {"1", "true", "yes", "on"} else "false"

provider = os.environ["CODEX_MODEL_PROVIDER_VALUE"]
lines = [
    f"model_provider = {toml_str('CODEX_MODEL_PROVIDER_VALUE')}",
    f"model = {toml_str('CODEX_MODEL_VALUE')}",
    f"model_reasoning_effort = {toml_str('CODEX_REASONING_EFFORT_VALUE')}",
    f"disable_response_storage = {toml_bool('CODEX_DISABLE_RESPONSE_STORAGE_VALUE')}",
    "",
    f"[model_providers.{provider}]",
    f"name = {toml_str('CODEX_PROVIDER_NAME_VALUE')}",
    f"base_url = {toml_str('CODEX_PROVIDER_BASE_URL_VALUE')}",
    f"wire_api = {toml_str('CODEX_WIRE_API_VALUE')}",
    f"requires_openai_auth = {toml_bool('CODEX_REQUIRES_OPENAI_AUTH_VALUE')}",
]
print("\n".join(lines))
PY
}

write_claude_config() {
  local claude_dir="${TARGET_HOME}/.claude"
  local settings_path="${claude_dir}/settings.json"

  info "Writing Claude Code settings under ${claude_dir}"
  ensure_dir "${claude_dir}" "700"

  CLAUDE_AUTH_TOKEN_VALUE="${CLAUDE_AUTH_TOKEN}" \
    CLAUDE_BASE_URL_VALUE="${CLAUDE_BASE_URL}" \
    CLAUDE_MODEL_VALUE="${CLAUDE_MODEL}" \
    CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS_VALUE="${CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS}" \
    CLAUDE_CODE_DISABLE_1M_CONTEXT_VALUE="${CLAUDE_CODE_DISABLE_1M_CONTEXT}" \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC_VALUE="${CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC}" \
    CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT_VALUE="${CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT}" \
    CLAUDE_SKIP_WORKFLOW_USAGE_WARNING_VALUE="${CLAUDE_SKIP_WORKFLOW_USAGE_WARNING}" \
    python3 - <<'PY' | atomic_write "${settings_path}" "600"
import json
import os

model = os.environ["CLAUDE_MODEL_VALUE"]

def as_bool(name: str) -> bool:
    return os.environ[name].lower() in {"1", "true", "yes", "on"}

settings = {
    "env": {
        "ANTHROPIC_AUTH_TOKEN": os.environ.get("CLAUDE_AUTH_TOKEN_VALUE", ""),
        "ANTHROPIC_BASE_URL": os.environ["CLAUDE_BASE_URL_VALUE"],
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": model,
        "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": model,
        "ANTHROPIC_DEFAULT_OPUS_MODEL": model,
        "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": model,
        "ANTHROPIC_DEFAULT_SONNET_MODEL": model,
        "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": model,
        "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": os.environ["CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS_VALUE"],
        "CLAUDE_CODE_DISABLE_1M_CONTEXT": os.environ["CLAUDE_CODE_DISABLE_1M_CONTEXT_VALUE"],
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": os.environ["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC_VALUE"],
    },
    "model": "opus",
    "skipDangerousModePermissionPrompt": as_bool("CLAUDE_SKIP_DANGEROUS_MODE_PERMISSION_PROMPT_VALUE"),
    "skipWorkflowUsageWarning": as_bool("CLAUDE_SKIP_WORKFLOW_USAGE_WARNING_VALUE"),
}

print(json.dumps(settings, indent=2, ensure_ascii=False))
PY
}

install_openai_skills() {
  [[ "${INSTALL_SKILLS}" == "true" ]] || return 0

  local codex_skills_dir="${CODEX_HOME}/skills"
  local helper="${CODEX_HOME}/skills/.system/skill-installer/scripts/install-skill-from-github.py"
  local repo_dir
  local skill
  local src
  local dest

  info "Installing curated Codex skills"
  ensure_dir "${codex_skills_dir}" "755"

  for skill in "${SKILLS[@]}"; do
    [[ -n "${skill}" ]] || continue
    if [[ ! "${skill}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
      warn "Skipping invalid skill name: ${skill}"
      continue
    fi

    dest="${codex_skills_dir}/${skill}"

    if [[ -e "${dest}" || -e "${codex_skills_dir}/.system/${skill}" ]]; then
      if [[ "${FORCE_SKILLS}" == "true" && -e "${dest}" ]]; then
        backup_file "${dest}"
        run rm -rf -- "${dest}"
      else
        info "Skill already exists, skipping: ${skill}"
        continue
      fi
    fi

    if [[ -f "${helper}" ]]; then
      info "Installing skill with local skill-installer helper: ${skill}"
      if [[ "${DRY_RUN}" == "true" ]]; then
        print_cmd env "CODEX_HOME=${CODEX_HOME}" python3 "${helper}" --repo openai/skills --ref "${OPENAI_SKILLS_REF}" --path "skills/.curated/${skill}" >&2
      else
        run_as_target_user env "CODEX_HOME=${CODEX_HOME}" python3 "${helper}" --repo openai/skills --ref "${OPENAI_SKILLS_REF}" --path "skills/.curated/${skill}"
      fi
      continue
    fi

    ensure_tmpdir
    repo_dir="${_tmpdir}/openai-skills"
    if [[ ! -d "${repo_dir}" ]]; then
      run git clone --depth 1 --branch "${OPENAI_SKILLS_REF}" -- "${OPENAI_SKILLS_REPO}" "${repo_dir}"
    fi

    src="${repo_dir}/skills/.curated/${skill}"
    if [[ ! -d "${src}" ]]; then
      warn "Skill not found in openai/skills curated list: ${skill}"
      continue
    fi

    info "Installing skill: ${skill}"
    if [[ "${DRY_RUN}" == "true" ]]; then
      print_cmd cp -a "${src}" "${dest}" >&2
    else
      cp -a -- "${src}" "${dest}"
    fi
    target_chown_tree "${dest}"
  done
}

print_summary() {
  cat <<EOF

Setup summary:
  target user:      ${TARGET_USER}
  target home:      ${TARGET_HOME}
  install method:   ${INSTALL_METHOD}
  Codex home:       ${CODEX_HOME}
  Codex config:     ${CODEX_HOME}/config.toml
  Codex auth:       ${CODEX_HOME}/auth.json
  Claude settings:  ${TARGET_HOME}/.claude/settings.json
  skills dir:       ${CODEX_HOME}/skills

Notes:
  - Add ${TARGET_HOME}/.local/bin to PATH if native/npm user installs put binaries there.
  - Run with --verify-tools after PATH is refreshed to check codex/claude versions.
  - Restart Codex after installing or changing skills.
  - Set OPENAI_API_KEY and ANTHROPIC_AUTH_TOKEN before running to avoid blank credentials.
EOF
}

main() {
  parse_args "$@"
  resolve_target_home
  acquire_lock

  info "Target user: ${TARGET_USER}"
  info "Target home: ${TARGET_HOME}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    warn "Dry-run mode is active; no changes will be written"
  fi

  install_apt_dependencies
  require_cmd python3
  require_cmd curl
  require_cmd git

  install_cli_tools
  write_codex_config
  write_claude_config
  install_openai_skills
  verify_tools
  print_summary
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi

~~~



~~~c
  OPENAI_API_KEY="你的key" ANTHROPIC_AUTH_TOKEN="你的token" ./setup-codex-claude-skills.sh 
~~~





优化

~~~c
  - 主线程负责最终实现和集成。                                                                    - 启动 3-5 个 xhigh 子 agent，每个 agent 只负责一个独立方向。                                   - 子 agent 必须返回：发现的问题、建议改法、证据来源、不可确定项。                               - 不要让多个 agent 修改同一文件；如果需要写文件，由主线程统一整合。   
~~~



