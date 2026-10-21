/** Format arguments for the shell reported alongside the command; never execute them here. */
export function formatRegistrationCommand(args, platform = process.platform) {
  const powershell = platform === 'win32';
  const quote = powershell
    ? (value) => `'${value.replaceAll("'", "''")}'`
    : (value) => `'${value.replaceAll("'", "'\\''")}'`;
  return {
    register_mcp_shell: powershell ? 'powershell' : 'posix',
    register_mcp_command: `${powershell ? '& ' : ''}${args.map(quote).join(' ')}`,
  };
}
