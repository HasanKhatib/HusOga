// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Swedish (`sv`).
class AppLocalizationsSv extends AppLocalizations {
  AppLocalizationsSv([String locale = 'sv']) : super(locale);

  @override
  String get appTitle => 'HusÖga';

  @override
  String get reports => 'Rapporter';

  @override
  String get createReport => 'Skapa rapport';

  @override
  String get noReportsYet => 'Inga rapporter ännu';

  @override
  String get createFirstAssessment => 'Skapa din första riskbedömning';

  @override
  String get houseData => 'Husdata';

  @override
  String get calculate => 'Beräkna';

  @override
  String get riskAssessment => 'Riskbedömning';

  @override
  String get riskScore => 'Riskpoäng';

  @override
  String get lowRisk => 'Låg risk';

  @override
  String get mediumRisk => 'Medel risk';

  @override
  String get highRisk => 'Hög risk';

  @override
  String get lifecycleFlags => 'Livscykelflaggor';

  @override
  String get noLifecycleFlags => 'Inga livscykelflaggor';

  @override
  String get costExposure => '5–10 års kostnadsexponering';

  @override
  String get min => 'Min';

  @override
  String get likely => 'Trolig';

  @override
  String get max => 'Max';

  @override
  String get negotiationChecklist => 'Förhandlingschecklista';

  @override
  String get deleteReportTitle => 'Radera rapport?';

  @override
  String removeReport(String label) {
    return 'Ta bort \"$label\"?';
  }

  @override
  String get cancel => 'Avbryt';

  @override
  String get delete => 'Radera';

  @override
  String get report => 'Rapport';

  @override
  String get score => 'Poäng';

  @override
  String get legalDisclaimer =>
      'Inte ett ersättande för professionell besiktning. Ej anslutet till Boverket/Folkhälsomyndigheten.';

  @override
  String get byggnadstyp => 'Byggnadstyp';

  @override
  String get byggnadsar => 'Byggnadsår';

  @override
  String get boarea => 'Boarea (m²)';

  @override
  String get grundlaeggning => 'Grundläggning';

  @override
  String get yttertakType => 'Yttertak typ';

  @override
  String get yttertakAge => 'Yttertak ålder (år)';

  @override
  String get fasadType => 'Fasad typ';

  @override
  String get fasadAge => 'Fasad ålder (år)';

  @override
  String get uppvarmning => 'Uppvärmning';

  @override
  String get ventilation => 'Ventilation';

  @override
  String get askSellerRoofFacadeDrainage =>
      'Fråga säljare: När byttes tak/fasad/dränering senast?';

  @override
  String get demandBuyerInspection => 'Kräv köpargenomgång inom 6 månader';

  @override
  String get betongplatta70sCheck =>
      'Betongplatta 70-tal: Undersök isolering; överväg teknisk utredning';

  @override
  String get vatrumCheck =>
      'Våtrum: Äldre gjutjärnsbrunn? Tätskikt bytt vid renovering?';

  @override
  String get roofSnowCheck =>
      'Tak: Om snötäckt vid besiktning, kontrollera när snön smält';

  @override
  String get settings => 'Inställningar';

  @override
  String get language => 'Språk';

  @override
  String get english => 'Engelska';

  @override
  String get swedish => 'Svenska';

  @override
  String get suterranghus => 'Suterränghus';

  @override
  String get enplanshus => 'Enplanshus';

  @override
  String get flerplanshus => 'Flerplanshus';

  @override
  String get radhus => 'Radhus';

  @override
  String get parhus => 'Parhus';

  @override
  String get kedjehus => 'Kedjehus';

  @override
  String get ovrigt => 'Övrigt';

  @override
  String get kellarYttervaeggar => 'Källar/ytterväggar';

  @override
  String get betongplatta => 'Betongplatta';

  @override
  String get torpargrund => 'Torpargrund';

  @override
  String get kellargrund => 'Källargrund';

  @override
  String get betongpannor => 'Betongpannor';

  @override
  String get tegeltak => 'Tegeltak';

  @override
  String get plattak => 'Plåttak';

  @override
  String get takpapp => 'Takpapp';

  @override
  String get gummiduk => 'Gummiduk';

  @override
  String get tegel => 'Tegel';

  @override
  String get tra => 'Trä';

  @override
  String get puts => 'Puts';

  @override
  String get blandad => 'Blandad';

  @override
  String get direktverkandeEl => 'Direktverkande el';

  @override
  String get luftLuftVarmepump => 'Luft/luft värmepump';

  @override
  String get bergvarme => 'Bergvärme';

  @override
  String get fjarrvarme => 'Fjärrvärme';

  @override
  String get pellet => 'Pellet';

  @override
  String get olja => 'Olja';

  @override
  String get gas => 'Gas';

  @override
  String get sjalvdrag => 'Självdrag';

  @override
  String get franluft => 'Frånluft';

  @override
  String get ftxMekanisk => 'FTX/mekanisk';

  @override
  String get componentRoof => 'Tak';

  @override
  String get componentDrainage => 'Dränering';

  @override
  String get componentFacade => 'Fasad';

  @override
  String get componentVentilation => 'Ventilation';

  @override
  String get componentHeating => 'Uppvärmning';

  @override
  String get componentWetRooms => 'Våtrum';

  @override
  String get triggeredBy => 'Uttlöst av: ';

  @override
  String get deleteToAddAnother =>
      'Radera en rapport för att lägga till en ny, eller uppgradera för obegränsade.';

  @override
  String get upgradeToUnlimit => 'Uppgradera för obegränsade rapporter';

  @override
  String get reportNotFound => 'Rapporten hittades inte';

  @override
  String get appSlogan => 'Hus Risk Översikt';

  @override
  String get address => 'Adress';

  @override
  String get addressHint => 'Gata eller fastighetsbeteckning';

  @override
  String get devUnlockPurchased => 'Lås upp betalfunktioner (dev)';

  @override
  String get reportIntro =>
      'Denna bedömning baseras på byggnormer (SBR BILAGA 3) och typiska livslängder. Den markerar komponenter som kan behöva uppmärksamhet de kommande 5–10 åren.';

  @override
  String get reportSectionScore => 'Total riskpoäng';

  @override
  String get reportSectionFlags => 'Komponenter att granska';

  @override
  String get reportSectionCost => 'Uppskattad kostnadsexponering';

  @override
  String get reportSectionChecklist => 'Förslag till förhandlingspunkter';
}
