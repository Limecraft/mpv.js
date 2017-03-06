const React = require("react");

module.exports = class extends React.Component {
  // PUBLIC API.

  command(cmd, ...args) {
    this.postData("run_command", [cmd].concat(args));
  }

  property(name, value) {
    this.postData("set_property", {name, value});
  }

  keypress({key, shiftKey, ctrlKey, altKey}) {
    // Don't need modifier events.
    if ([
      "Shift", "Control", "Alt",
      "Compose", "CapsLock", "Meta",
    ].includes(key)) return;

    if (key.startsWith("Arrow")) {
      key = key.slice(5).toUpperCase();
      if (shiftKey) {
        key = `Shift+${key}`;
      }
    }
    if (ctrlKey) {
      key = `Ctrl+${key}`;
    }
    if (altKey) {
      key = `Alt+${key}`;
    }

    // Ignore exit keys for default keybindings settings. Kludgy but mpv
    // don't propose anything better.
    if ([
      "q", "Q", "ESC", "POWER", "STOP",
      "CLOSE_WIN", "CLOSE_WIN", "Ctrl+c",
      "AR_PLAY_HOLD", "AR_CENTER_HOLD",
    ].includes(key)) return;

    this.command("keypress", key);
  }

  // PRIVATE METHODS, DO NOT USE!

  constructor(props) {
    super(props);
    this.handleMessage = this.handleMessage.bind(this);
  }
  componentDidMount() {
    this.refs.plugin.addEventListener("message", this.handleMessage, false);
  }
  componentWillUnmount() {
    this.refs.plugin.removeEventListener("message", this.handleMessage, false);
  }
  handleMessage(e) {
    const msg = e.data;
    const {type, data} = msg;
    if (type === "property_change" && this.props.onPropertyChange) {
      this.props.onPropertyChange(data);
    } else if (type === "ready" && this.props.onReady) {
      this.props.onReady(this);
    }
  }
  postData(type, data) {
    const msg = {type, data};
    this.refs.plugin.postMessage(msg);
  }
  render() {
    return React.createElement("embed", {
      ref: "plugin",
      type: "application/x-mpvjs",
      style: {display: "block", width: "100%", height: "100%"},
      "data-src": this.props.src,
    });
  }
};
