namespace Solera.API.DTOs;

public class SiteSettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateSettingDto
{
    public string Value { get; set; } = string.Empty;
}

public class BulkUpdateSettingsDto
{
    public List<SettingKeyValuePair> Settings { get; set; } = new();
}

public class SettingKeyValuePair
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
