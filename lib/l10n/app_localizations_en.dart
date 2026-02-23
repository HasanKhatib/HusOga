// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'HusÖga';

  @override
  String get reports => 'Reports';

  @override
  String get createReport => 'Create report';

  @override
  String get noReportsYet => 'No reports yet';

  @override
  String get createFirstAssessment => 'Create your first risk assessment';

  @override
  String get houseData => 'House data';

  @override
  String get calculate => 'Calculate';

  @override
  String get riskAssessment => 'Risk assessment';

  @override
  String get riskScore => 'Risk score';

  @override
  String get lowRisk => 'Low risk';

  @override
  String get mediumRisk => 'Medium risk';

  @override
  String get highRisk => 'High risk';

  @override
  String get lifecycleFlags => 'Lifecycle flags';

  @override
  String get noLifecycleFlags => 'No lifecycle flags';

  @override
  String get costExposure => '5–10 year cost exposure';

  @override
  String get min => 'Min';

  @override
  String get likely => 'Likely';

  @override
  String get max => 'Max';

  @override
  String get negotiationChecklist => 'Negotiation checklist';

  @override
  String get deleteReportTitle => 'Delete report?';

  @override
  String removeReport(String label) {
    return 'Remove \"$label\"?';
  }

  @override
  String get cancel => 'Cancel';

  @override
  String get delete => 'Delete';

  @override
  String get report => 'Report';

  @override
  String get score => 'Score';

  @override
  String get legalDisclaimer =>
      'Not a replacement for professional inspection. Not affiliated with Boverket/Folkhälsomyndigheten.';

  @override
  String get byggnadstyp => 'Building type';

  @override
  String get byggnadsar => 'Build year';

  @override
  String get boarea => 'Living area (m²)';

  @override
  String get grundlaeggning => 'Foundation';

  @override
  String get yttertakType => 'Roof type';

  @override
  String get yttertakAge => 'Roof age (years)';

  @override
  String get fasadType => 'Facade type';

  @override
  String get fasadAge => 'Facade age (years)';

  @override
  String get uppvarmning => 'Heating';

  @override
  String get ventilation => 'Ventilation';

  @override
  String get askSellerRoofFacadeDrainage =>
      'Ask seller: When were roof, facade, drainage last replaced?';

  @override
  String get demandBuyerInspection => 'Demand buyer inspection within 6 months';

  @override
  String get betongplatta70sCheck =>
      '1970s concrete slab: Check insulation; consider technical survey';

  @override
  String get vatrumCheck =>
      'Wet rooms: Old cast iron? Sealing replaced at renovation?';

  @override
  String get roofSnowCheck =>
      'Roof: If snow-covered at inspection, check when melted';

  @override
  String get settings => 'Settings';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get swedish => 'Swedish';

  @override
  String get suterranghus => 'Semi-detached with basement';

  @override
  String get enplanshus => 'Single-storey house';

  @override
  String get flerplanshus => 'Multi-storey house';

  @override
  String get radhus => 'Row house';

  @override
  String get parhus => 'Semi-detached';

  @override
  String get kedjehus => 'Chain house';

  @override
  String get ovrigt => 'Other';

  @override
  String get kellarYttervaeggar => 'Cellar/outer walls';

  @override
  String get betongplatta => 'Concrete slab';

  @override
  String get torpargrund => 'Timber frame foundation';

  @override
  String get kellargrund => 'Cellar foundation';

  @override
  String get betongpannor => 'Concrete tiles';

  @override
  String get tegeltak => 'Tile roof';

  @override
  String get plattak => 'Metal roof';

  @override
  String get takpapp => 'Roofing felt';

  @override
  String get gummiduk => 'Rubber membrane';

  @override
  String get tegel => 'Brick';

  @override
  String get tra => 'Wood';

  @override
  String get puts => 'Render';

  @override
  String get blandad => 'Mixed';

  @override
  String get direktverkandeEl => 'Direct electric';

  @override
  String get luftLuftVarmepump => 'Air-to-air heat pump';

  @override
  String get bergvarme => 'Ground source heat pump';

  @override
  String get fjarrvarme => 'District heating';

  @override
  String get pellet => 'Pellet';

  @override
  String get olja => 'Oil';

  @override
  String get gas => 'Gas';

  @override
  String get sjalvdrag => 'Natural ventilation';

  @override
  String get franluft => 'Extract ventilation';

  @override
  String get ftxMekanisk => 'FTX/mechanical';

  @override
  String get componentRoof => 'Roof';

  @override
  String get componentDrainage => 'Drainage';

  @override
  String get componentFacade => 'Facade';

  @override
  String get componentVentilation => 'Ventilation';

  @override
  String get componentHeating => 'Heating';

  @override
  String get componentWetRooms => 'Wet rooms';

  @override
  String get triggeredBy => 'Triggered by: ';

  @override
  String get deleteToAddAnother =>
      'Delete a report to add another, or upgrade to unlock unlimited.';

  @override
  String get upgradeToUnlimit => 'Upgrade to unlock unlimited reports';

  @override
  String get reportNotFound => 'Report not found';

  @override
  String get appSlogan => 'House Risk Snapshot';

  @override
  String get address => 'Address';

  @override
  String get addressHint => 'Street or property identifier';

  @override
  String get devUnlockPurchased => 'Unlock paid features (dev)';

  @override
  String get reportIntro =>
      'This assessment is based on building norms (SBR BILAGA 3) and typical lifespans. It highlights components that may need attention in the next 5–10 years.';

  @override
  String get reportSectionScore => 'Overall risk score';

  @override
  String get reportSectionFlags => 'Components to review';

  @override
  String get reportSectionCost => 'Estimated cost exposure';

  @override
  String get reportSectionChecklist => 'Suggested negotiation points';
}
