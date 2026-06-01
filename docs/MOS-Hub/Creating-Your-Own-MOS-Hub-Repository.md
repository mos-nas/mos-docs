---
sidebar_label: 🛍️ Creating Your Own MOS Hub Repository
sidebar_position: 1
---

# 🛍️ Creating Your Own MOS Hub Repository

The MOS Hub allows users to contribute and share Docker templates with the community.  
By creating your own MOS Hub repository on GitHub, you can provide custom application templates that integrate seamlessly into the MOS interface.

This guide explains how to structure your repository, create templates, and make them available through the MOS Hub.

---

## 📁 Repository Structure

A MOS Hub repository follows a specific structure that the MOS Hub can recognize and process.

**Required structure:**

```
your-repository/
├── docker/
│   ├── Template1.json
│   ├── Template2.json
│   └── ...
├── compose/
│   ├── App1/
│   │   ├── compose.yaml
│   │   ├── .env
│   │   └── template.json
│   └── ...
├── plugins/
│   ├── nvidia-driver.json
│   ├── coral-driver.json
│   └── ...
├── images/
│   ├── Template1Icon.png
│   ├── Template2Icon.png
│   └── ...
├── (LICENSE)
├── maintainer.json
└── README.md
```

---

### 📂 Folder Descriptions

#### `docker/`

Contains individual Docker container templates in JSON format.

Each file represents a single container configuration that can be deployed directly from the MOS Hub.

:::tip Use this folder for:
- Single-container applications
- Simple services
:::

---

#### `compose/`

Contains Docker Compose stack templates.

Each subfolder represents a complete application stack with multiple containers.

**Required files per compose app:**
- `compose.yaml` – Docker Compose configuration
- `.env` – Environment variables (optional)
- `template.json` – Metadata for MOS Hub display

:::tip Use this folder for:
- Multi-container applications
- Complex service stacks
:::

---

#### `plugins/`

Contains system plugins, drivers, and utilities in JSON format.

Each file represents a system component that can be installed from the MOS Hub.

:::tip Use this folder for:
- Hardware drivers (Nvidia, AMD, Coral)
- System utilities
- Kernel modules
- Special-purpose tools
:::

---

#### `images/`

Contains icon files for your templates and plugins.

**Supported formats:**
- PNG
- JPG

Icons are displayed in the MOS Hub interface.

:::tip Recommended:
Use consistent icon sizes for a professional appearance.
:::

---

#### `maintainer.json`

Defines metadata about the repository maintainer.

**Example:**

```json
{
  "maintainer": "NAME",
  "donation": "DONATION URL"
}
```

This file is required for the MOS Hub to recognize your repository.

---

#### `README.md`

Provides documentation about your template collection.

:::tip Recommended contents:
- Repository overview
- List of included templates
- Installation instructions
- Known issues or limitations
:::

---

## 📦 Creating Templates in MOS

The easiest way to create valid Docker templates is to build them directly within MOS.

MOS automatically generates the correct JSON structure when you configure a container through the interface.

---

### Step 1: Create a Container in MOS

Navigate to:

**Docker → Sandwich Menu → Add Container**

Configure your container with all necessary settings:
- Name
- Repository
- Network configuration
- Paths
- Ports
- Environment variables

Once configured, deploy the container to verify it works correctly.

---

### Step 2: Export the Template

After the container is running, MOS automatically stores the template in:

```
/boot/config/system/docker/templates/TEMPLATE.json
```

Access this file to retrieve your template JSON.

---

### Step 3: Edit the Template

Before uploading to GitHub, edit the template to ensure compatibility across systems.

**Recommended changes:**

#### Set Standard Paths

Replace absolute paths with the standard MOS path structure:

```json
"/mnt/cache/appdata/yourapp": "/config"
```

**Why:**  
Using `/mnt/cache/...` ensures templates work consistently across different MOS installations.

---

#### Set PUID and PGID

If the container supports user/group IDs, configure them:

```json
"PUID": "500",
"PGID": "500"
```

:::tip Recommended values:
`PUID=500` and `PGID=500`

Why:
These values are widely supported and avoid permission conflicts.
:::

---

### Step 4: Upload to GitHub

Create a repository on GitHub following the structure described above.

Place your edited template JSON files in the appropriate folder:
- Single containers → `docker/`
- Compose stacks → `compose/<app-name>/`

Add corresponding icons to the `images/` folder.

---

## ➕ Adding Your Repository to the MOS Hub

Once your repository is published on GitHub, it can be added to any MOS instance.

Navigate to:

**Settings → System Configuration → MOS Hub Settings**

In the **MOS Hub** section, add your repository URL:

```
https://github.com/your-username/your-repository
```

---

### Refresh the Hub

After adding the repository:

1. Click **Refresh** in the MOS Hub settings
2. Navigate to **Docker → MOS Hub**
3. Your templates should now appear in the list

:::warning
If your templates do not appear, verify:
- Repository structure is correct
- `maintainer.json` exists and is valid
- Template JSON files are properly formatted
:::
---

## ✅ Template JSON Validation

Templates must follow the MOS template schema.

**Common issues:**
- Missing required fields
- Invalid JSON syntax
- Incorrect path formats

:::tip Recommendation:
Test your templates locally in MOS before publishing them to GitHub.
:::

---

## 🐳 Docker Compose Templates

Compose templates require additional metadata files.

### `template.json`

Defines how the compose stack appears in the MOS Hub.

**Example:**

```json
{
  "name": "Your App Name",
  "description": "Brief description of the application",
  "icon": "https://example.com/icon.png",
  "webui": "http://{IP}:8080",
  "category": [ "Media" ]
}
```

---

### `.env`

Defines environment variables that users can customize during deployment.

**Example:**

```env
PORT=8080
TZ=UTC
APP_DATA=/mnt/cache/appdata/yourapp
```

Users can adjust these values when deploying the stack.

---

## 📚 Best Practices

### Use Descriptive Names

Template names should clearly indicate the application purpose.

**Example:**  
`Plex Media Server` instead of `plex`

---

### Provide Clear Descriptions

Each template should include a description explaining what the application does.

---

### Test Before Publishing

Always deploy and test templates in a clean MOS environment before adding them to your repository.

---

### Document Configuration

If your templates require specific configuration steps, document them in the repository README.

---

### Keep Templates Updated

Regularly update templates to reflect:
- New container versions
- Security updates
- Improved default configurations

---

## 🌍 Community Repositories

The MOS ecosystem benefits from community-contributed repositories.

**Official repositories:**
- [ich777/mos-templates](https://github.com/ich777/mos-templates)
- [s3ppo/docker_json_templates](https://github.com/s3ppo/docker_json_templates)

**Your repository can:**
- Provide niche applications
- Offer specialized configurations
- Serve as backups for your own deployments

---

## 🔧 Troubleshooting

### Templates Not Appearing

**Possible causes:**
- Repository URL incorrect
- Missing `maintainer.json`
- Invalid JSON syntax
- Hub not refreshed

:::tip Solution:
Verify repository structure and refresh the MOS Hub.
:::

---

### Template Deployment Fails

**Possible causes:**
- Incorrect path mappings
- Missing required environment variables
- Network configuration conflicts

:::tip Solution:
Review the template JSON and compare it to a working MOS container configuration.
:::

---

### Icons Not Displaying

**Possible causes:**
- Icon file missing from `images/` folder
- Incorrect icon path in template
- Unsupported image format

:::tip Solution:
Ensure icons are in PNG or JPG format and correctly referenced in the template.
:::

---

## 🧩 Creating Plugin Templates

Plugins differ from Docker containers — they install system-level components like drivers and utilities.

---

### Plugin JSON Structure

Plugin templates use a different structure than Docker templates.

**Example plugin JSON** (`plugins/my-driver.json`):

```json
{
  "name": "My Driver",
  "description": "Brief description of the driver or utility",
  "category": [ "Driver" ],
  "repository": "https://github.com/username/my-driver-repo",
  "architecture": [ "amd64", "arm64" ],
  "driver": true,
  "icon": "https://example.com/icon.png",
  "author": "your-name",
  "homepage": "https://example.com/driver-homepage",
  "support": "https://github.com/username/my-driver-repo/issues",
  "donate": "https://paypal.me/username"
}
```

---

### Plugin JSON Fields

#### Required Fields

- **name**  
  Display name of the plugin.

- **description**  
  Brief description of what the plugin provides.

- **category**  
  Array of categories. Common options:

| Category | Description |
|---|---|
| `AI` | Artificial Intelligence applications |
| `Backup` | Backup and recovery tools |
| `Crypto` | Cryptocurrency and blockchain applications |
| `Downloader` | Download and upload tools |
| `Driver` | Hardware drivers (GPU, TPU, TV tuners) |
| `Game Server` | Game server applications |
| `Home Automation` | Smart home and automation tools |
| `Hosting` | Web hosting and server applications |
| `Media` | Media servers and streaming applications |
| `Monitoring` | System monitoring and logging tools |
| `Network` | Network services and tools |
| `Productivity` | Productivity and office applications |
| `Security` | Security and firewall tools |
| `System` | System utilities and tools |
| `Utilities` | General purpose utilities |
| `Misc` | Miscellaneous applications |

- **repository**  
  GitHub repository URL for the plugin installation source.

- **architecture**  
  Array of supported architectures:
  - `amd64` (x86_64)
  - `arm64` (ARM 64-bit)

---

#### Optional Fields

- **driver**  
  Boolean flag indicating whether this is a driver plugin.  
  Set to `true` for driver-type plugins.

- **icon**  
  URL to an icon image.  
  Can be hosted on GitHub or external sources.

- **author**  
  Plugin author name.

- **homepage**  
  Official homepage or documentation URL.

- **support**  
  Support URL (GitHub issues, forum, etc.).

- **donate**  
  Donation URL (PayPal, Ko-fi, etc.).

---

### Plugin Installation Flow

When a user installs a plugin from the MOS Hub:

1. MOS reads the plugin JSON metadata
2. The `repository` URL points to an installation script or package
3. MOS executes the installation routine provided by the repository
4. The plugin integrates into the system

:::warning Important:
The `repository` field should point to a repository that provides installation scripts compatible with MOS.
:::

---

### Plugin Use Cases

**Drivers:**
- Nvidia GPU drivers
- AMD GPU drivers
- Coral Edge TPU drivers
- DVB TV tuner drivers

**Utilities:**
- GPU monitoring tools (intel-gpu-top, amdgpu-top)
- Docker host access shims
- Filesystem drivers (ZFS, BTRFS)

---

### Plugin Best Practices

- Test plugin installations on clean MOS systems
- Document installation requirements in the plugin repository
- Provide uninstall scripts when applicable
- Clearly indicate architecture compatibility
- Use descriptive category tags

---

## ✅ Summary

Creating a MOS Hub repository allows you to:
- Share Docker templates with the community
- Maintain your own template collection
- Provide specialized application configurations

**Key steps:**
1. Create a GitHub repository with the correct structure
2. Build and test templates in MOS
3. Export template JSON files from `/boot/config/system/docker/templates/`
4. Edit templates to use standard paths and recommended PUID/PGID values
5. Create plugin templates for drivers and utilities (optional)
6. Upload templates, plugins, and icons to GitHub
7. Add repository URL to MOS Hub settings

Once configured, your templates and plugins will be available to all MOS users who add your repository to their Hub.

Proper documentation and testing ensure a high-quality contribution to the MOS ecosystem.

---

## 📖 Example Repositories

The following repositories provide excellent examples of MOS Hub structure:

- [ich777/mos-templates](https://github.com/ich777/mos-templates) – Official template collection with Docker templates and plugins
- [s3ppo/docker_json_templates](https://github.com/s3ppo/docker_json_templates) – Community Docker templates

Reviewing these repositories helps understand template best practices and structure.

---

## 📢 Share Your Repository

Once your MOS Hub repository is created and published, consider sharing it with the community!

Join the **#moshub-community-repositories** channel on the official MOS Discord server to:
- Showcase your repository to other users
- Get feedback and suggestions from the community
- Help others discover your templates and plugins

:::note
Your repository will be available to all MOS users who add it to their Hub settings — sharing it in Discord helps increase visibility and engagement.
:::

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._