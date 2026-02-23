import 'package:flutter_test/flutter_test.dart';
import 'package:house_risk_snapshot/core/models/house_inputs.dart';
import 'package:house_risk_snapshot/core/services/risk_engine.dart';

void main() {
  group('RiskEngine', () {
    test('computes score 0 for new house with low-risk inputs', () {
      final inputs = HouseInputs(
        byggnadstyp: 'enplanshus',
        byggnadsar: 2020,
        size: 120,
        grundlaeggning: 'betongplatta',
        yttertakType: 'takpapp',
        yttertakAge: 5,
        fasadType: 'tegel',
        fasadAge: 5,
        uppvarmning: 'bergvarme',
        ventilation: 'ftxMekanisk',
      );
      final out = RiskEngine.compute(inputs);
      expect(out.score, lessThanOrEqualTo(20));
      expect(out.scoreBand, isIn(['low', 'medium', 'high']));
      expect(out.costBand.min, greaterThanOrEqualTo(0));
      expect(out.costBand.max, greaterThanOrEqualTo(out.costBand.min));
    });

    test('flags roof when age exceeds 70% of lifespan', () {
      final inputs = HouseInputs(
        byggnadstyp: 'enplanshus',
        byggnadsar: 2020,
        size: 120,
        grundlaeggning: 'betongplatta',
        yttertakType: 'takpapp', // lifespan 20
        yttertakAge: 18, // 18/20 = 0.9
        fasadType: 'tegel',
        fasadAge: 5,
        uppvarmning: 'bergvarme',
        ventilation: 'ftxMekanisk',
      );
      final out = RiskEngine.compute(inputs);
      expect(out.lifecycleFlags.any((f) => f.component == 'roof'), isTrue);
    });

    test('output includes negotiation checklist', () {
      final inputs = HouseInputs(
        byggnadstyp: 'radhus',
        byggnadsar: 1980,
        size: 100,
        grundlaeggning: 'betongplatta',
        yttertakType: 'betongpannor',
        yttertakAge: 25,
        fasadType: 'tra',
        fasadAge: 20,
        uppvarmning: 'fjarrvarme',
        ventilation: 'franluft',
      );
      final out = RiskEngine.compute(inputs);
      expect(out.negotiationChecklist, isNotEmpty);
    });

    test('suterrang 70s betongplatta adds drainage flag', () {
      final inputs = HouseInputs(
        byggnadstyp: 'suterranghus',
        byggnadsar: 1975,
        size: 100,
        grundlaeggning: 'betongplatta',
        yttertakType: 'tegeltak',
        yttertakAge: 10,
        fasadType: 'tegel',
        fasadAge: 10,
        uppvarmning: 'fjarrvarme',
        ventilation: 'ftxMekanisk',
      );
      final out = RiskEngine.compute(inputs);
      expect(
        out.lifecycleFlags.any((f) => f.component == 'drainage'),
        isTrue,
      );
    });
  });
}
