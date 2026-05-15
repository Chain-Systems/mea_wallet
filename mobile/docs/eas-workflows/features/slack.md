# Slack

## Presetup

1. Create a Slack app at https://api.slack.com/apps.
2. Enable Incoming Webhooks for the app.
3. Add two webhooks — one for a success channel (e.g. `#deploys`) and one for a failure/alerts channel (e.g. `#deploy-alerts`).
4. Store the webhook URLs in EAS for each environment used by these workflows:

   ```sh
   # Production
   eas env:create --environment production --name SLACK_HOOK_URL_SUCCESS --value 'https://hooks.slack.com/services/...' --visibility sensitive
   eas env:create --environment production --name SLACK_HOOK_URL_FAILURE --value 'https://hooks.slack.com/services/...' --visibility sensitive

   # Preview
   eas env:create --environment preview --name SLACK_HOOK_URL_SUCCESS --value 'https://hooks.slack.com/services/...' --visibility sensitive
   eas env:create --environment preview --name SLACK_HOOK_URL_FAILURE --value 'https://hooks.slack.com/services/...' --visibility sensitive
   ```

5. Confirm the app has working EAS credentials for Android Play Store and iOS App Store submissions before running production deploy workflows.

The workflows use Expo's `eas/send_slack_message` action with explicit `url` set to `SLACK_HOOK_URL_SUCCESS` or `SLACK_HOOK_URL_FAILURE` depending on outcome. Neither webhook URL is committed to source control.

> **Message formatting:** `eas/send_slack_message` sends plain text via Slack incoming webhooks. Slack supports limited formatting (`*bold*`, `_italic_`, `` `code` ``, `\n` line breaks) but not full Markdown. Custom block-kit templates are not supported through this action.

## Workflows

### Android Production Build

Builds the Android app with the `production` build profile and posts build status and URL to Slack. Submit is handled separately.

```sh
eas workflow:run .eas/workflows/deploy_android.yml
```

### iOS Production Deploy

Builds the iOS app with the `production` build profile, submits it with the `production` submit profile, then posts build and submit status to Slack.

```sh
eas workflow:run .eas/workflows/deploy_ios.yml
```

### Full Production Build

Runs Android and iOS production builds in parallel, then posts both platform statuses, versions, and build links to Slack. Submit is handled separately.

```sh
eas workflow:run .eas/workflows/deploy.yml
```

### Android Preview Build

Builds Android with the `preview` build profile and posts the EAS build link to Slack.

```sh
eas workflow:run .eas/workflows/preview_android.yml
```

## References

- EAS workflow syntax: https://docs.expo.dev/eas/workflows/syntax/
- EAS pre-packaged build and submit jobs: https://docs.expo.dev/eas/workflows/pre-packaged-jobs/
- Slack incoming webhooks: https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks
