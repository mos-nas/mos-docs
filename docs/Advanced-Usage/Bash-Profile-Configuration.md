---
sidebar_label: 📝 Bash Profile Configuration
sidebar_position: 6
---

# 📝 Bash Profile Configuration

MOS supports a custom `.bash_profile` configuration file that allows you to customize your SSH session environment.

## Configuration File

Create the file at `/boot/config/system/bash_profile` to enable custom bash settings:

```bash
# Example: Create the file
touch /boot/config/system/bash_profile
```

After creating the file, **reboot MOS** to create the symlink to `/root/.bash_profile`.

The file will be automatically symlinked to `/root/.bash_profile` on every boot if it exists.

---

## What you can configure:

| Feature | Description |
|---------|-------------|
| **Aliases** | Create shortcuts for frequently used commands |
| **Environment Variables** | Set custom PATH, PS1, and other variables |
| **Default Editor** | Configure your preferred editor (nano, vim, etc.) |
| **Colors & Prompt** | Customize terminal colors and shell prompt |
| **Functions** | Define custom bash functions |

---

## Example Configuration

```bash
# ============================================
# Aliases - Shortcuts for frequently used commands
# ============================================
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias c='clear'

# ============================================
# Default Editor
# ============================================
export EDITOR=nano
# export EDITOR=vim

# ============================================
# Custom Prompt with Colors
# ============================================
export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# ============================================
# Custom PATH
# ============================================
export PATH="/usr/bin/plugins:$PATH"

# ============================================
# History Settings
# ============================================
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL='ignoredups'
shopt -s histappend

# ============================================
# Update Terminal Size
# ============================================
alias resize='stty -a | grep -q "rows" && stty rows $((${LINES:-24}) columns $((${COLUMNS:-80})))'
```

---

## Available Color Codes for Prompt

| Code | Color |
|------|-------|
| `\[\033[01;32m\]` | Bright Green |
| `\[\033[01;34m\]` | Bright Blue |
| `\[\033[00m\]` | Reset/Default |
| `\[\033[01;31m\]` | Bright Red |
| `\[\033[01;33m\]` | Bright Yellow |
| `\[\033[01;35m\]` | Bright Magenta |
| `\[\033[01;36m\]` | Bright Cyan |

---

## Troubleshooting

### File not symlinked after reboot?

- Verify the file exists at `/boot/config/system/bash_profile`
- Check the file permissions (should be readable)
- Ensure MOS rebooted completely

### Syntax errors in bash_profile?

- Connect via SSH and check `/root/.bash_profile` for errors
- Use `bash -n /root/.bash_profile` to validate syntax
- Temporarily rename the file to `/boot/config/system/bash_profile.bak` to disable it

---

## ✅ Summary

- Create file at `/boot/config/system/bash_profile`
- Reboot MOS to create symlink to `/root/.bash_profile`
- Configure aliases, colors, and environment variables
- Useful for SSH session customization

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
