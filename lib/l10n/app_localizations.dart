import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_sv.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('sv'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'HusÖga'**
  String get appTitle;

  /// No description provided for @reports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get reports;

  /// No description provided for @createReport.
  ///
  /// In en, this message translates to:
  /// **'Create report'**
  String get createReport;

  /// No description provided for @noReportsYet.
  ///
  /// In en, this message translates to:
  /// **'No reports yet'**
  String get noReportsYet;

  /// No description provided for @createFirstAssessment.
  ///
  /// In en, this message translates to:
  /// **'Create your first risk assessment'**
  String get createFirstAssessment;

  /// No description provided for @houseData.
  ///
  /// In en, this message translates to:
  /// **'House data'**
  String get houseData;

  /// No description provided for @calculate.
  ///
  /// In en, this message translates to:
  /// **'Calculate'**
  String get calculate;

  /// No description provided for @riskAssessment.
  ///
  /// In en, this message translates to:
  /// **'Risk assessment'**
  String get riskAssessment;

  /// No description provided for @riskScore.
  ///
  /// In en, this message translates to:
  /// **'Risk score'**
  String get riskScore;

  /// No description provided for @lowRisk.
  ///
  /// In en, this message translates to:
  /// **'Low risk'**
  String get lowRisk;

  /// No description provided for @mediumRisk.
  ///
  /// In en, this message translates to:
  /// **'Medium risk'**
  String get mediumRisk;

  /// No description provided for @highRisk.
  ///
  /// In en, this message translates to:
  /// **'High risk'**
  String get highRisk;

  /// No description provided for @lifecycleFlags.
  ///
  /// In en, this message translates to:
  /// **'Lifecycle flags'**
  String get lifecycleFlags;

  /// No description provided for @noLifecycleFlags.
  ///
  /// In en, this message translates to:
  /// **'No lifecycle flags'**
  String get noLifecycleFlags;

  /// No description provided for @costExposure.
  ///
  /// In en, this message translates to:
  /// **'5–10 year cost exposure'**
  String get costExposure;

  /// No description provided for @min.
  ///
  /// In en, this message translates to:
  /// **'Min'**
  String get min;

  /// No description provided for @likely.
  ///
  /// In en, this message translates to:
  /// **'Likely'**
  String get likely;

  /// No description provided for @max.
  ///
  /// In en, this message translates to:
  /// **'Max'**
  String get max;

  /// No description provided for @negotiationChecklist.
  ///
  /// In en, this message translates to:
  /// **'Negotiation checklist'**
  String get negotiationChecklist;

  /// No description provided for @deleteReportTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete report?'**
  String get deleteReportTitle;

  /// No description provided for @removeReport.
  ///
  /// In en, this message translates to:
  /// **'Remove \"{label}\"?'**
  String removeReport(String label);

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @report.
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get report;

  /// No description provided for @score.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get score;

  /// No description provided for @legalDisclaimer.
  ///
  /// In en, this message translates to:
  /// **'Not a replacement for professional inspection. Not affiliated with Boverket/Folkhälsomyndigheten.'**
  String get legalDisclaimer;

  /// No description provided for @byggnadstyp.
  ///
  /// In en, this message translates to:
  /// **'Building type'**
  String get byggnadstyp;

  /// No description provided for @byggnadsar.
  ///
  /// In en, this message translates to:
  /// **'Build year'**
  String get byggnadsar;

  /// No description provided for @boarea.
  ///
  /// In en, this message translates to:
  /// **'Living area (m²)'**
  String get boarea;

  /// No description provided for @grundlaeggning.
  ///
  /// In en, this message translates to:
  /// **'Foundation'**
  String get grundlaeggning;

  /// No description provided for @yttertakType.
  ///
  /// In en, this message translates to:
  /// **'Roof type'**
  String get yttertakType;

  /// No description provided for @yttertakAge.
  ///
  /// In en, this message translates to:
  /// **'Roof age (years)'**
  String get yttertakAge;

  /// No description provided for @fasadType.
  ///
  /// In en, this message translates to:
  /// **'Facade type'**
  String get fasadType;

  /// No description provided for @fasadAge.
  ///
  /// In en, this message translates to:
  /// **'Facade age (years)'**
  String get fasadAge;

  /// No description provided for @uppvarmning.
  ///
  /// In en, this message translates to:
  /// **'Heating'**
  String get uppvarmning;

  /// No description provided for @ventilation.
  ///
  /// In en, this message translates to:
  /// **'Ventilation'**
  String get ventilation;

  /// No description provided for @askSellerRoofFacadeDrainage.
  ///
  /// In en, this message translates to:
  /// **'Ask seller: When were roof, facade, drainage last replaced?'**
  String get askSellerRoofFacadeDrainage;

  /// No description provided for @demandBuyerInspection.
  ///
  /// In en, this message translates to:
  /// **'Demand buyer inspection within 6 months'**
  String get demandBuyerInspection;

  /// No description provided for @betongplatta70sCheck.
  ///
  /// In en, this message translates to:
  /// **'1970s concrete slab: Check insulation; consider technical survey'**
  String get betongplatta70sCheck;

  /// No description provided for @vatrumCheck.
  ///
  /// In en, this message translates to:
  /// **'Wet rooms: Old cast iron? Sealing replaced at renovation?'**
  String get vatrumCheck;

  /// No description provided for @roofSnowCheck.
  ///
  /// In en, this message translates to:
  /// **'Roof: If snow-covered at inspection, check when melted'**
  String get roofSnowCheck;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @swedish.
  ///
  /// In en, this message translates to:
  /// **'Swedish'**
  String get swedish;

  /// No description provided for @suterranghus.
  ///
  /// In en, this message translates to:
  /// **'Semi-detached with basement'**
  String get suterranghus;

  /// No description provided for @enplanshus.
  ///
  /// In en, this message translates to:
  /// **'Single-storey house'**
  String get enplanshus;

  /// No description provided for @flerplanshus.
  ///
  /// In en, this message translates to:
  /// **'Multi-storey house'**
  String get flerplanshus;

  /// No description provided for @radhus.
  ///
  /// In en, this message translates to:
  /// **'Row house'**
  String get radhus;

  /// No description provided for @parhus.
  ///
  /// In en, this message translates to:
  /// **'Semi-detached'**
  String get parhus;

  /// No description provided for @kedjehus.
  ///
  /// In en, this message translates to:
  /// **'Chain house'**
  String get kedjehus;

  /// No description provided for @ovrigt.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get ovrigt;

  /// No description provided for @kellarYttervaeggar.
  ///
  /// In en, this message translates to:
  /// **'Cellar/outer walls'**
  String get kellarYttervaeggar;

  /// No description provided for @betongplatta.
  ///
  /// In en, this message translates to:
  /// **'Concrete slab'**
  String get betongplatta;

  /// No description provided for @torpargrund.
  ///
  /// In en, this message translates to:
  /// **'Timber frame foundation'**
  String get torpargrund;

  /// No description provided for @kellargrund.
  ///
  /// In en, this message translates to:
  /// **'Cellar foundation'**
  String get kellargrund;

  /// No description provided for @betongpannor.
  ///
  /// In en, this message translates to:
  /// **'Concrete tiles'**
  String get betongpannor;

  /// No description provided for @tegeltak.
  ///
  /// In en, this message translates to:
  /// **'Tile roof'**
  String get tegeltak;

  /// No description provided for @plattak.
  ///
  /// In en, this message translates to:
  /// **'Metal roof'**
  String get plattak;

  /// No description provided for @takpapp.
  ///
  /// In en, this message translates to:
  /// **'Roofing felt'**
  String get takpapp;

  /// No description provided for @gummiduk.
  ///
  /// In en, this message translates to:
  /// **'Rubber membrane'**
  String get gummiduk;

  /// No description provided for @tegel.
  ///
  /// In en, this message translates to:
  /// **'Brick'**
  String get tegel;

  /// No description provided for @tra.
  ///
  /// In en, this message translates to:
  /// **'Wood'**
  String get tra;

  /// No description provided for @puts.
  ///
  /// In en, this message translates to:
  /// **'Render'**
  String get puts;

  /// No description provided for @blandad.
  ///
  /// In en, this message translates to:
  /// **'Mixed'**
  String get blandad;

  /// No description provided for @direktverkandeEl.
  ///
  /// In en, this message translates to:
  /// **'Direct electric'**
  String get direktverkandeEl;

  /// No description provided for @luftLuftVarmepump.
  ///
  /// In en, this message translates to:
  /// **'Air-to-air heat pump'**
  String get luftLuftVarmepump;

  /// No description provided for @bergvarme.
  ///
  /// In en, this message translates to:
  /// **'Ground source heat pump'**
  String get bergvarme;

  /// No description provided for @fjarrvarme.
  ///
  /// In en, this message translates to:
  /// **'District heating'**
  String get fjarrvarme;

  /// No description provided for @pellet.
  ///
  /// In en, this message translates to:
  /// **'Pellet'**
  String get pellet;

  /// No description provided for @olja.
  ///
  /// In en, this message translates to:
  /// **'Oil'**
  String get olja;

  /// No description provided for @gas.
  ///
  /// In en, this message translates to:
  /// **'Gas'**
  String get gas;

  /// No description provided for @sjalvdrag.
  ///
  /// In en, this message translates to:
  /// **'Natural ventilation'**
  String get sjalvdrag;

  /// No description provided for @franluft.
  ///
  /// In en, this message translates to:
  /// **'Extract ventilation'**
  String get franluft;

  /// No description provided for @ftxMekanisk.
  ///
  /// In en, this message translates to:
  /// **'FTX/mechanical'**
  String get ftxMekanisk;

  /// No description provided for @componentRoof.
  ///
  /// In en, this message translates to:
  /// **'Roof'**
  String get componentRoof;

  /// No description provided for @componentDrainage.
  ///
  /// In en, this message translates to:
  /// **'Drainage'**
  String get componentDrainage;

  /// No description provided for @componentFacade.
  ///
  /// In en, this message translates to:
  /// **'Facade'**
  String get componentFacade;

  /// No description provided for @componentVentilation.
  ///
  /// In en, this message translates to:
  /// **'Ventilation'**
  String get componentVentilation;

  /// No description provided for @componentHeating.
  ///
  /// In en, this message translates to:
  /// **'Heating'**
  String get componentHeating;

  /// No description provided for @componentWetRooms.
  ///
  /// In en, this message translates to:
  /// **'Wet rooms'**
  String get componentWetRooms;

  /// No description provided for @triggeredBy.
  ///
  /// In en, this message translates to:
  /// **'Triggered by: '**
  String get triggeredBy;

  /// No description provided for @deleteToAddAnother.
  ///
  /// In en, this message translates to:
  /// **'Delete a report to add another, or upgrade to unlock unlimited.'**
  String get deleteToAddAnother;

  /// No description provided for @upgradeToUnlimit.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to unlock unlimited reports'**
  String get upgradeToUnlimit;

  /// No description provided for @reportNotFound.
  ///
  /// In en, this message translates to:
  /// **'Report not found'**
  String get reportNotFound;

  /// No description provided for @appSlogan.
  ///
  /// In en, this message translates to:
  /// **'House Risk Snapshot'**
  String get appSlogan;

  /// No description provided for @address.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// No description provided for @addressHint.
  ///
  /// In en, this message translates to:
  /// **'Street or property identifier'**
  String get addressHint;

  /// No description provided for @devUnlockPurchased.
  ///
  /// In en, this message translates to:
  /// **'Unlock paid features (dev)'**
  String get devUnlockPurchased;

  /// No description provided for @reportIntro.
  ///
  /// In en, this message translates to:
  /// **'This assessment is based on building norms (SBR BILAGA 3) and typical lifespans. It highlights components that may need attention in the next 5–10 years.'**
  String get reportIntro;

  /// No description provided for @reportSectionScore.
  ///
  /// In en, this message translates to:
  /// **'Overall risk score'**
  String get reportSectionScore;

  /// No description provided for @reportSectionFlags.
  ///
  /// In en, this message translates to:
  /// **'Components to review'**
  String get reportSectionFlags;

  /// No description provided for @reportSectionCost.
  ///
  /// In en, this message translates to:
  /// **'Estimated cost exposure'**
  String get reportSectionCost;

  /// No description provided for @reportSectionChecklist.
  ///
  /// In en, this message translates to:
  /// **'Suggested negotiation points'**
  String get reportSectionChecklist;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'sv'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'sv':
      return AppLocalizationsSv();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
