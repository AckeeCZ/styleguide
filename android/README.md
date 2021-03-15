# Android CodeStyle 
## Android Studio Settings
Sharing Android Studio formatting settings between all developers is critical in terms of cleaner and much readable Merge Requests. That's the reason why we have shared Android Studio settings. 

Due to a limitations in [Settings repository](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html) where we can select what we want to share and what not (eg. with this approach we would need to share Theme, Fonts, ...) we need to manually import this zip file to Android studio.

### Content of settings

Code style is defined to match official [Android Kotlin Style Guide](https://developer.android.com/kotlin/style-guide). Although there are some exception where we deviate a little:
- Max length of the line is 150 characters. Then the line is wrapped

Among Code style settings there is a couple more useful stuff:
- More live templates
    - `td` - `Timber.d("$methodName ")`
    - `tm` - `Timber.d("$methodName called with parameters $params")`
    - `lv` - `lateinit var`
    - `nt` - create basic template for a test 
```
@Test
fun `$NAME$`() {
    $SELECTION$
}
```
- Template for new files/classes which force developer to add documentation of the file
```
/**
 * TODO add class description
 */
```

### How to import settings
* Download [settings.jar](./settings.jar) from this repository
* In Android Studio choose at the top menu `File - Import Settings` and choose `settings.jar` from previous step
* Pick all variants and press OK
* Restart Android Studio
* In `Editor - Code Style` should be Ackee scheme.

## Detekt config
Our app uses [detekt](https://github.com/detekt/detekt) for static analysation of source code. Common configuration is defined in [detekt-config.yml](./detekt-config.yml) file. 
